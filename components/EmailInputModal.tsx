import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { X } from 'lucide-react-native';
import { isValidEmailDomain } from '@/services/emailService';

interface EmailInputModalProps {
  visible: boolean;
  onSubmit: (email: string) => Promise<void>;
  onCancel: () => void;
}

export const EmailInputModal: React.FC<EmailInputModalProps> = ({
  visible,
  onSubmit,
  onCancel
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!isValidEmailDomain(email)) {
      setError('Please use a valid MOE, Schools, or Educational institution email address');
      return;
    }

    try {
      setIsLoading(true);
      await onSubmit(email.trim().toLowerCase());
    } catch (error) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEmail('');
    setError('');
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View className="bg-white rounded-2xl p-6 w-full max-w-md">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-geist-semibold text-gray-900">
                Access AI Chat
              </Text>
              <TouchableOpacity onPress={handleCancel} className="p-2">
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Description */}
            <Text className="text-gray-600 mb-6">
              Please enter your MOE, Schools, or Educational institution email address to access the AI chat feature.
            </Text>

            {/* Email Input */}
            <View className="mb-4">
              <Text className="text-gray-700 font-geist-medium mb-2">
                Email Address
              </Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="your.name@moe.edu.sg"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                className="border border-gray-300 rounded-lg px-4 py-3 text-gray-900"
                editable={!isLoading}
                onSubmitEditing={handleSubmit}
              />
            </View>

            {/* Error Message */}
            {error ? (
              <Text className="text-red-600 text-sm mb-4">{error}</Text>
            ) : null}

            {/* Approved Domains Info */}
            <View className="bg-blue-50 rounded-lg p-3 mb-6">
              <Text className="text-blue-800 text-sm font-geist-medium mb-1">
                Accepted email domains:
              </Text>
              <Text className="text-blue-700 text-xs">
                • @moe.gov.sg{'\n'}
                • @moe.edu.sg{'\n'}
                • @schools.gov.sg{'\n'}
                • @*.edu.sg
              </Text>
            </View>

            {/* Action Buttons */}
            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={handleCancel}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg"
                disabled={isLoading}
              >
                <Text className="text-gray-700 font-geist-medium text-center">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSubmit}
                className={`flex-1 py-3 px-4 rounded-lg ${
                  isLoading
                    ? 'bg-gray-400'
                    : 'bg-blue-600'
                }`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <View className="flex-row justify-center items-center">
                    <ActivityIndicator size="small" color="white" />
                    <Text className="text-white font-geist-medium ml-2">
                      Verifying...
                    </Text>
                  </View>
                ) : (
                  <Text className="text-white font-geist-medium text-center">
                    Continue
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};