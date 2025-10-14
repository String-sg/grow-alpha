import { useRouter } from 'expo-router';
import { CheckCircle, Home, Plus } from 'lucide-react-native';
import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

interface PodcastCreationSuccessModalProps {
  visible: boolean;
  onClose: () => void;
  podcastTitle: string;
  onCreateAnother: () => void;
}

export function PodcastCreationSuccessModal({
  visible,
  onClose,
  podcastTitle,
  onCreateAnother,
}: PodcastCreationSuccessModalProps) {
  const router = useRouter();

  const handleGoHome = () => {
    onClose();
    router.push('/');
  };

  const handleCreateAnother = () => {
    onClose();
    onCreateAnother();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <View className="bg-white rounded-2xl p-8 w-full max-w-sm items-center shadow-2xl">
          {/* Success Icon */}
          <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-6">
            <CheckCircle size={48} color="#16A34A" />
          </View>

          {/* Success Message */}
          <Text
            style={{ fontFamily: 'Geist_600SemiBold' }}
            className="text-2xl text-gray-900 text-center mb-2"
          >
            🎉 Success!
          </Text>

          <Text className="text-gray-600 text-center text-base mb-2">
            Your podcast has been created successfully
          </Text>

          <Text
            style={{ fontFamily: 'Geist_500Medium' }}
            className="text-gray-900 text-center text-lg mb-8"
          >
            "{podcastTitle}"
          </Text>

          <Text className="text-gray-500 text-center text-sm mb-8">
            The podcast is now available in the app and ready for users to discover.
          </Text>

          {/* Action Buttons */}
          <View className="w-full space-y-3">
            {/* Go to Homepage */}
            <TouchableOpacity
              onPress={handleGoHome}
              className="w-full py-4 bg-blue-600 rounded-lg items-center justify-center flex-row"
              activeOpacity={0.8}
            >
              <Home size={20} color="white" />
              <Text
                style={{ fontFamily: 'Geist_500Medium' }}
                className="text-white text-lg ml-2"
              >
                Go to Homepage
              </Text>
            </TouchableOpacity>

            {/* Create Another */}
            <TouchableOpacity
              onPress={handleCreateAnother}
              className="w-full py-4 bg-gray-100 rounded-lg items-center justify-center flex-row"
              activeOpacity={0.8}
            >
              <Plus size={20} color="#374151" />
              <Text
                style={{ fontFamily: 'Geist_500Medium' }}
                className="text-gray-700 text-lg ml-2"
              >
                Create Another
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}