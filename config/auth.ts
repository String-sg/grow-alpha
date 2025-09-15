import Constants from 'expo-constants';

// Google OAuth Configuration using Expo Constants
// This approach properly handles environment variables in Expo

const EXPO_USERNAME = Constants.expoConfig?.extra?.expoUsername || 'kahhow';
const NODE_ENV = Constants.expoConfig?.extra?.nodeEnv || 'development';



export const GOOGLE_OAUTH_CONFIG = {
  CLIENT_ID: Constants.expoConfig?.extra?.googleClientId || '',
  CLIENT_SECRET: Constants.expoConfig?.extra?.googleClientSecret || '',
  REDIRECT_URI: NODE_ENV === 'production' 
    ? 'https://grow.string.sg/' // Your production domain
    : 'http://localhost:8081/',
};


// Domain validation
export const MOE_DOMAIN = 'moe.edu.sg';

// Storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'auth_access_token',
  REFRESH_TOKEN: 'auth_refresh_token',
  USER_UUID: 'auth_user_uuid',
  USER_DATA: 'auth_user_data',
} as const;

// Session configuration
export const SESSION_CONFIG = {
  TOKEN_EXPIRY_DAYS: 7,
  AUTO_REFRESH: true,
} as const; 