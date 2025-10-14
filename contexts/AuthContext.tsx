import { GOOGLE_OAUTH_CONFIG, MOE_DOMAIN, STORAGE_KEYS } from '@/config/auth';
import { processDemoEmailAccess } from '@/services/emailService';
import { userService, type DatabaseUser } from '@/services/userService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';

// Demo user configuration
const DEMO_USER = {
  id: 'demo-user',
  email: 'demo@moe.edu.sg',
  name: 'Demo User',
  uuid: 'demo-uuid-12345'
};

interface User {
  id: string;
  email: string;
  name: string;
  uuid: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isOffline: boolean;
  isDemoMode: boolean;
  hasValidEmail: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  enableDemoMode: () => Promise<void>;
  setDemoEmail: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Configuration is now imported from config/auth.ts

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [hasValidEmail, setHasValidEmail] = useState(false);

  // Check network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const wasOffline = isOffline;
      const isNowOnline = state.isConnected;

      setIsOffline(!isNowOnline);

      // Sync when coming back online
      if (wasOffline && isNowOnline && user && !isDemoMode) {
        console.log('Network reconnected, syncing user data...');
        syncUserWithDatabase();
      }
    });

    return () => unsubscribe();
  }, [isOffline, user, isDemoMode]);

  // Generate UUID for user
  const generateUUID = (): string => {
    return Crypto.randomUUID();
  };

  // Sync user data with database when online
  const syncUserWithDatabase = async () => {
    if (isOffline || isDemoMode || !user) return;

    try {
      console.log('Attempting to sync user with database...');
      const dbUser = await userService.createOrUpdateUser({
        google_id: user.id,
        uuid: user.uuid,
        email: user.email,
        name: user.name,
      });

      if (dbUser) {
        console.log('User synced with database successfully');

        // Update local UUID if database has different one
        if (dbUser.uuid !== user.uuid) {
          await AsyncStorage.setItem(STORAGE_KEYS.USER_UUID, dbUser.uuid);
          setUser({ ...user, uuid: dbUser.uuid });
        }
      }
    } catch (error) {
      console.error('Failed to sync user with database:', error);
    }
  };

  // Validate email domain
  const validateEmailDomain = (email: string): boolean => {
    const domain = email.split('@')[1];
    return domain === MOE_DOMAIN;
  };

  // Show whitelist error
  const showWhitelistError = () => {
    Alert.alert(
      'Access Denied',
      'Oops you are not whitelisted, please email lee_kah_how@moe.edu.sg if you think this is a mistake',
      [
        {
          text: 'Try Again',
          onPress: () => login(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  // Show offline error
  const showOfflineError = () => {
    Alert.alert(
      'No Internet Connection',
      'Please check your internet connection and try again.',
      [
        {
          text: 'OK',
          style: 'cancel',
        },
      ]
    );
  };

  // Store tokens and user data
  const storeAuthData = async (accessToken: string, refreshToken: string, userData: User) => {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.ACCESS_TOKEN, accessToken],
        [STORAGE_KEYS.REFRESH_TOKEN, refreshToken],
        [STORAGE_KEYS.USER_UUID, userData.uuid],
        [STORAGE_KEYS.USER_DATA, JSON.stringify(userData)],
      ]);
    } catch (error) {
      console.error('Error storing auth data:', error);
    }
  };

  // Clear stored auth data
  const clearAuthData = async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_UUID,
        STORAGE_KEYS.USER_DATA,
      ]);
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  // Get user info from Google and sync with database
  const getUserInfo = async (accessToken: string): Promise<User> => {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }

    const userInfo = await response.json();

    // Validate email domain
    if (!validateEmailDomain(userInfo.email)) {
      throw new Error('INVALID_DOMAIN');
    }

    // Generate or retrieve UUID from AsyncStorage first
    const existingUUID = await AsyncStorage.getItem(STORAGE_KEYS.USER_UUID);
    const uuid = existingUUID || generateUUID();

    const userData = {
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name,
      uuid,
    };

    // Sync with database when online
    try {
      if (!isOffline) {
        console.log('Syncing user with database...');
        const dbUser = await userService.createOrUpdateUser({
          google_id: userInfo.id,
          uuid: uuid,
          email: userInfo.email,
          name: userInfo.name,
        });

        if (dbUser) {
          console.log('User synced with database successfully:', dbUser.email);

          // Update local storage with database UUID if different
          if (dbUser.uuid !== uuid) {
            await AsyncStorage.setItem(STORAGE_KEYS.USER_UUID, dbUser.uuid);
            userData.uuid = dbUser.uuid;
          }
        }
      } else {
        console.log('Offline - user will sync with database when connection is restored');
      }
    } catch (error) {
      console.error('Failed to sync user with database:', error);
      // Continue with local data - don't block authentication
    }

    return userData;
  };

  // Enable demo mode
  const enableDemoMode = async () => {
    try {
      // Clear any existing demo email data to force fresh email entry
      await AsyncStorage.multiRemove(['demo_email', 'demo_email_domain']);

      console.log('Enabling demo mode...');
      setIsDemoMode(true);
      setUser(DEMO_USER);
      setHasValidEmail(false); // Reset to require new email entry
      setIsLoading(false);

      console.log('Demo mode enabled - user will need to enter email for chat access', {
        isDemoMode: true,
        hasValidEmail: false,
        user: DEMO_USER
      });
    } catch (error) {
      console.error('Error enabling demo mode:', error);
      setIsDemoMode(true);
      setUser(DEMO_USER);
      setHasValidEmail(false);
      setIsLoading(false);
    }
  };

  // Set demo email and validate it
  const setDemoEmail = async (email: string): Promise<boolean> => {
    try {
      const result = await processDemoEmailAccess(email);

      if (result.isValid) {
        // Store validated email
        await AsyncStorage.setItem('demo_email', result.email!);
        await AsyncStorage.setItem('demo_email_domain', result.domainCategory!);

        // Update demo user with real email
        const demoUserWithEmail = {
          ...DEMO_USER,
          email: result.email!,
          name: `Demo User (${result.domainCategory})`
        };

        setUser(demoUserWithEmail);
        setHasValidEmail(true);

        console.log('Demo email validated:', {
          email: result.email,
          domain: result.domainCategory,
          notificationSent: result.notificationSent
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error('Error setting demo email:', error);
      return false;
    }
  };

  // Check for stored demo email on startup
  const checkStoredDemoEmail = async () => {
    try {
      const storedEmail = await AsyncStorage.getItem('demo_email');
      const storedDomain = await AsyncStorage.getItem('demo_email_domain');

      if (storedEmail && storedDomain && isDemoMode) {
        const demoUserWithEmail = {
          ...DEMO_USER,
          email: storedEmail,
          name: `Demo User (${storedDomain})`
        };

        setUser(demoUserWithEmail);
        setHasValidEmail(true);

        console.log('Restored demo email from storage:', storedEmail);
      }
    } catch (error) {
      console.error('Error checking stored demo email:', error);
    }
  };

  // Login function
  const login = async () => {
    if (isOffline) {
      showOfflineError();
      return;
    }

    try {
      setIsLoading(true);

      if (Platform.OS === 'web') {
        // Web-specific OAuth flow
        await handleWebOAuth();
      } else {
        // Mobile-specific OAuth flow
        await handleMobileOAuth();
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.message === 'INVALID_DOMAIN') {
        showWhitelistError();
      } else {
        Alert.alert(
          'Login Failed',
          'An error occurred during login. Please try again.',
          [
            {
              text: 'Try Again',
              onPress: () => login(),
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ]
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Web-specific OAuth flow
  const handleWebOAuth = async () => {
    // Generate PKCE challenge
    const codeVerifier = Crypto.randomUUID();
    const codeChallenge = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      codeVerifier,
      { encoding: Crypto.CryptoEncoding.BASE64 }
    ).then(result => result.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, ''));

    // Store code verifier for later use
    await AsyncStorage.setItem('code_verifier', codeVerifier);

    // Build OAuth URL
    const params = new URLSearchParams({
      client_id: GOOGLE_OAUTH_CONFIG.CLIENT_ID,
      redirect_uri: GOOGLE_OAUTH_CONFIG.REDIRECT_URI,
      response_type: 'code',
      scope: 'openid profile email',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    
    // Redirect to Google OAuth
    window.location.href = authUrl;
  };

  // Mobile-specific OAuth flow
  const handleMobileOAuth = async () => {
    // Generate PKCE code verifier and challenge
    const codeVerifier = Crypto.randomUUID();
    const codeChallenge = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      codeVerifier,
      { encoding: Crypto.CryptoEncoding.BASE64 }
    ).then(result => result.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, ''));

    // Store code verifier for later use
    await AsyncStorage.setItem('code_verifier', codeVerifier);

    // Create auth request
    const request = new AuthSession.AuthRequest({
      clientId: GOOGLE_OAUTH_CONFIG.CLIENT_ID,
      scopes: ['openid', 'profile', 'email'],
      redirectUri: GOOGLE_OAUTH_CONFIG.REDIRECT_URI,
      responseType: AuthSession.ResponseType.Code,
      codeChallenge: codeChallenge,
      codeChallengeMethod: AuthSession.CodeChallengeMethod.S256,
    });

    // Start auth session
    const result = await request.promptAsync({
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    });

    if (result.type === 'success' && result.params.code) {
      await handleOAuthCallback(result.params.code);
    } else if (result.type === 'cancel') {
      // User cancelled authentication
    }
  };

  // Handle OAuth callback (common for both web and mobile)
  const handleOAuthCallback = async (code: string) => {
    const codeVerifier = await AsyncStorage.getItem('code_verifier');
    
    // Exchange code for tokens
    const tokenResponse = await AuthSession.exchangeCodeAsync(
      {
        clientId: GOOGLE_OAUTH_CONFIG.CLIENT_ID,
        clientSecret: GOOGLE_OAUTH_CONFIG.CLIENT_SECRET,
        code: code,
        redirectUri: GOOGLE_OAUTH_CONFIG.REDIRECT_URI,
        extraParams: {
          code_verifier: codeVerifier!,
        },
      },
      {
        tokenEndpoint: 'https://oauth2.googleapis.com/token',
      }
    );

    // Get user info
    const userData = await getUserInfo(tokenResponse.accessToken);
    
    // Store auth data
    await storeAuthData(
      tokenResponse.accessToken,
      tokenResponse.refreshToken!,
      userData
    );

    setUser(userData);
    
    // Clear code verifier
    await AsyncStorage.removeItem('code_verifier');
  };

  // Logout function
  const logout = async () => {
    try {
      await clearAuthData();
      // Clear demo email data
      await AsyncStorage.multiRemove(['demo_email', 'demo_email_domain']);
      setUser(null);
      setHasValidEmail(false);
      setIsDemoMode(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Check existing auth on app startup
  const checkAuth = async () => {
    try {
      // Check for OAuth callback on web
      if (Platform.OS === 'web') {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        
        if (code) {
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
          
          // Process the OAuth callback
          await handleOAuthCallback(code);
          return;
        } else if (error) {
          console.error('OAuth error:', error);
          Alert.alert('OAuth Error', `Authentication failed: ${error}`);
          return;
        }
      }

      const [accessToken, userDataString] = await AsyncStorage.multiGet([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.USER_DATA,
      ]);

      if (accessToken[1] && userDataString[1]) {
        const userData = JSON.parse(userDataString[1]);
        
        // Validate token (you might want to add token validation here)
        setUser(userData);
      } else if (isDemoMode) {
        // Check for stored demo email if in demo mode
        await checkStoredDemoEmail();
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isOffline,
    isDemoMode,
    hasValidEmail,
    login,
    logout,
    checkAuth,
    enableDemoMode,
    setDemoEmail,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 