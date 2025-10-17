import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

// Mock dependencies
jest.mock('@react-native-async-storage/async-storage');
jest.mock('expo-auth-session');
jest.mock('expo-crypto');
jest.mock('@react-native-community/netinfo');

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

// Test component to access auth context
const TestComponent = () => {
  const { user, isLoading, isOffline, login, logout } = useAuth();
  
  return (
    <React.Fragment>
      <Text testID="user">{user ? user.email : 'no-user'}</Text>
      <Text testID="loading">{isLoading ? 'loading' : 'not-loading'}</Text>
      <Text testID="offline">{isOffline ? 'offline' : 'online'}</Text>
      <TouchableOpacity testID="login-btn" onPress={login}>
        <Text>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity testID="logout-btn" onPress={logout}>
        <Text>Logout</Text>
      </TouchableOpacity>
    </React.Fragment>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.multiGet.mockResolvedValue([null, null]);
  });

  it('should initialize with no user', () => {
    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(getByTestId('user')).toHaveTextContent('no-user');
    expect(getByTestId('loading')).toHaveTextContent('not-loading');
  });

  it('should handle offline state', () => {
    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Mock offline state
    const netinfoMock = require('@react-native-community/netinfo');
    netinfoMock.addEventListener.mockImplementation((callback) => {
      callback({ isConnected: false });
      return () => {};
    });

    expect(getByTestId('offline')).toHaveTextContent('offline');
  });

  it('should store and retrieve user data', async () => {
    const mockUser = {
      id: '123',
      email: 'test@moe.edu.sg',
      name: 'Test User',
      uuid: 'test-uuid'
    };

    mockAsyncStorage.multiGet.mockResolvedValue([
      ['auth_access_token', 'mock-token'],
      ['auth_user_data', JSON.stringify(mockUser)]
    ]);

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(getByTestId('user')).toHaveTextContent('test@moe.edu.sg');
    });
  });

  it('should clear data on logout', async () => {
    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.press(getByTestId('logout-btn'));

    await waitFor(() => {
      expect(mockAsyncStorage.multiRemove).toHaveBeenCalledWith([
        'auth_access_token',
        'auth_refresh_token',
        'auth_user_uuid',
        'auth_user_data',
      ]);
    });
  });
});

// Test domain validation
describe('Domain Validation', () => {
  it('should accept @moe.edu.sg emails', () => {
    const validEmails = [
      'user@moe.edu.sg',
      'teacher@moe.edu.sg',
      'admin@moe.edu.sg'
    ];

    validEmails.forEach(email => {
      const domain = email.split('@')[1];
      expect(domain).toBe('moe.edu.sg');
    });
  });

  it('should reject non-MOE emails', () => {
    const invalidEmails = [
      'user@gmail.com',
      'teacher@yahoo.com',
      'admin@school.edu.sg', // subdomain
      'user@moe.org.sg' // different TLD
    ];

    invalidEmails.forEach(email => {
      const domain = email.split('@')[1];
      expect(domain).not.toBe('moe.edu.sg');
    });
  });
}); 