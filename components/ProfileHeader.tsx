import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface ProfileHeaderProps {
  onProfilePress?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ onProfilePress }) => {
  const router = useRouter();
  const { user, isDemoMode } = useAuth();
  
  const handleProfilePress = () => {
    if (onProfilePress) {
      onProfilePress();
    } else {
      router.push('/profile');
    }
  };
  return (
    <View className="flex-row items-center justify-between mx-6 mt-5 mb-4">
      <View className="flex-row items-center">
        <Svg width={24} height={24} viewBox="0 0 48 48" fill="none" className="mr-2">
          <Path d="M23.9385 24.0635L24.0039 24V38L21.3984 26.6084L10 24L21.3984 21.3916L23.998 10.0254V10L24.001 10.0127L24.0039 10V10.0254L26.6045 21.3926L38.001 24H24.002V23.998L24 23.9971L23.999 24L23.9385 24.0635ZM23.998 23.998V23.9941L23.9385 23.9365L23.998 23.998ZM24.0039 23.9941V23.9971L24.0498 23.9492L24.0039 23.9941Z" fill="#0F172A"/>
          <Path d="M26.6025 26.6074L37.999 24H24L24.0479 24.0508L23.9961 24V38L26.6025 26.6074Z" fill="#0F172A"/>
          <Path d="M24 2C25.1046 2 26 2.89543 26 4C26 5.10457 25.1046 6 24 6C22.8954 6 22 5.10457 22 4C22 2.89543 22.8954 2 24 2Z" fill="#0F172A"/>
          <Path d="M24 42C25.1046 42 26 42.8954 26 44C26 45.1046 25.1046 46 24 46C22.8954 46 22 45.1046 22 44C22 42.8954 22.8954 42 24 42Z" fill="#0F172A"/>
          <Path d="M42 22C43.1046 22 44 22.8954 44 24C44 25.1046 43.1046 26 42 26C40.8954 26 40 25.1046 40 24C40 22.8954 40.8954 22 42 22Z" fill="#0F172A"/>
          <Path d="M2 22C3.10457 22 4 22.8954 4 24C4 25.1046 3.10457 26 2 26C0.895431 26 0 25.1046 0 24C0 22.8954 0.895431 22 2 22Z" fill="#0F172A"/>
          <Path d="M36.1403 36.1421C37.2449 36.1421 38.1403 37.0375 38.1403 38.1421C38.1403 39.2467 37.2449 40.1421 36.1403 40.1421C35.0357 40.1421 34.1403 39.2467 34.1403 38.1421C34.1403 37.0375 35.0357 36.1421 36.1403 36.1421Z" fill="#0F172A"/>
          <Path d="M7.85517 7.85791C8.95974 7.85791 9.85517 8.75334 9.85517 9.85791C9.85517 10.9625 8.95974 11.8579 7.85517 11.8579C6.7506 11.8579 5.85517 10.9625 5.85517 9.85791C5.85517 8.75334 6.7506 7.85791 7.85517 7.85791Z" fill="#0F172A"/>
          <Path d="M7.85547 36.1425C8.96004 36.1425 9.85547 37.0379 9.85547 38.1425C9.85547 39.247 8.96004 40.1425 7.85547 40.1425C6.7509 40.1425 5.85547 39.247 5.85547 38.1425C5.85547 37.0379 6.7509 36.1425 7.85547 36.1425Z" fill="#0F172A"/>
          <Path d="M36.1367 7.8581C37.2413 7.8581 38.1367 8.75353 38.1367 9.8581C38.1367 10.9627 37.2413 11.8581 36.1367 11.8581C35.0321 11.8581 34.1367 10.9627 34.1367 9.8581C34.1367 8.75353 35.0321 7.8581 36.1367 7.8581Z" fill="#0F172A"/>
        </Svg>
        <Text style={{ fontFamily: 'GeistMono_600SemiBold' }} className="text-black text-2xl">
          Grow
        </Text>
      </View>
      
      <View className="flex-row items-center gap-2">
        <TouchableOpacity
          onPress={handleProfilePress}
          className={`w-10 h-10 rounded-full overflow-hidden items-center justify-center ${
            isDemoMode ? 'bg-yellow-400' : 'bg-gray-200'
          }`}
          activeOpacity={0.8}
        >
          {user?.name ? (
            <Text className={`text-lg font-semibold ${
              isDemoMode ? 'text-yellow-800' : 'text-gray-700'
            }`}>
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </Text>
          ) : (
            <Image
              source={require('@/assets/images/cover-album.png')}
              style={{ width: 40, height: 40 }}
              resizeMode="cover"
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};