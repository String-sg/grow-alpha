import { AlertTriangle, X } from 'lucide-react-native';
import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

interface DeleteConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  podcastTitle: string;
  onConfirm: () => void;
  isDeleting?: boolean;
}

export function DeleteConfirmationModal({
  visible,
  onClose,
  podcastTitle,
  onConfirm,
  isDeleting = false,
}: DeleteConfirmationModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        <View className="bg-white rounded-2xl p-8 w-full max-w-sm items-center shadow-2xl">
          {/* Warning Icon */}
          <View className="w-20 h-20 bg-red-100 rounded-full items-center justify-center mb-6">
            <AlertTriangle size={48} color="#DC2626" />
          </View>

          {/* Warning Message */}
          <Text
            style={{ fontFamily: 'Geist_600SemiBold' }}
            className="text-2xl text-gray-900 text-center mb-2"
          >
            DELETE
          </Text>

          <Text
            style={{ fontFamily: 'Geist_500Medium' }}
            className="text-gray-900 text-center text-lg mb-4"
          >
            &ldquo;{podcastTitle}&rdquo;
          </Text>

          <Text className="text-red-600 text-center text-sm mb-8 font-medium">
            This action cannot be undone.
          </Text>

          {/* Action Buttons */}
          <View className="w-full space-y-3">
            {/* Cancel Button */}
            <TouchableOpacity
              onPress={onClose}
              disabled={isDeleting}
              className="w-full py-4 bg-gray-100 rounded-xl items-center justify-center border border-gray-200"
              activeOpacity={0.8}
            >
              <View className="flex-row items-center gap-2">
                <X size={20} color="#6B7280" />
                <Text
                  style={{ fontFamily: 'Geist_500Medium' }}
                  className="text-gray-700 text-base"
                >
                  Cancel
                </Text>
              </View>
            </TouchableOpacity>

            {/* Delete Button */}
            <TouchableOpacity
              onPress={onConfirm}
              disabled={isDeleting}
              className={`w-full py-4 rounded-xl items-center justify-center ${
                isDeleting ? 'bg-red-300' : 'bg-red-600'
              }`}
              activeOpacity={0.8}
            >
              <View className="flex-row items-center gap-2">
                <Text
                  style={{ fontFamily: 'Geist_600SemiBold' }}
                  className="text-white text-base"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Podcast'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}