import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { ArrowLeft, Upload } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddContentScreen() {
  const router = useRouter();
  const { isAdmin, user } = useAuth();
  const [contentType, setContentType] = useState<'podcast' | 'quiz' | 'educational'>('podcast');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Redirect non-admin users
  React.useEffect(() => {
    if (!isAdmin) {
      Alert.alert(
        'Access Denied',
        'You do not have permission to access this page.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    }
  }, [isAdmin, router]);

  const handleSubmit = () => {
    Alert.alert(
      'Feature Coming Soon',
      'Content management functionality will be available in the next update. Your form data:\n\nType: ' +
      contentType.charAt(0).toUpperCase() + contentType.slice(1) +
      '\nTitle: ' + title +
      '\nDescription: ' + description,
      [{ text: 'OK' }]
    );
  };

  const handleFileUpload = () => {
    Alert.alert(
      'Feature Coming Soon',
      'File upload functionality will be available in the next update.',
      [{ text: 'OK' }]
    );
  };

  // Don't render if not admin
  if (!isAdmin) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center"
            activeOpacity={0.8}
          >
            <ArrowLeft size={20} color="#374151" />
          </TouchableOpacity>

          <Text style={{ fontFamily: 'GeistMono_600SemiBold' }} className="text-xl text-gray-900">
            Add Content
          </Text>

          <View className="w-10" />
        </View>

        {/* Admin Badge */}
        <View className="px-6 py-3 bg-blue-50">
          <Text className="text-blue-800 text-sm font-medium">
            👑 Admin Panel - {user?.name}
          </Text>
        </View>

        {/* Form Content */}
        <View className="px-6 py-6">
          {/* Content Type Selection */}
          <View className="mb-6">
            <Text className="text-gray-700 text-base font-medium mb-3">Content Type</Text>
            <View className="flex-row gap-3">
              {[
                { key: 'podcast', label: 'Podcast' },
                { key: 'quiz', label: 'Quiz' },
                { key: 'educational', label: 'Educational' },
              ].map((type) => (
                <TouchableOpacity
                  key={type.key}
                  onPress={() => setContentType(type.key as any)}
                  className={`px-4 py-2 rounded-lg border ${
                    contentType === type.key
                      ? 'bg-blue-600 border-blue-600'
                      : 'bg-white border-gray-300'
                  }`}
                  activeOpacity={0.8}
                >
                  <Text
                    className={`font-medium ${
                      contentType === type.key ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Title Field */}
          <View className="mb-6">
            <Text className="text-gray-700 text-base font-medium mb-2">Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Enter content title"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Description Field */}
          <View className="mb-6">
            <Text className="text-gray-700 text-base font-medium mb-2">Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Enter content description"
              multiline
              numberOfLines={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white"
              placeholderTextColor="#9CA3AF"
              textAlignVertical="top"
            />
          </View>

          {/* File Upload Section */}
          {contentType === 'podcast' && (
            <View className="mb-6">
              <Text className="text-gray-700 text-base font-medium mb-2">Audio File</Text>
              <TouchableOpacity
                onPress={handleFileUpload}
                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg items-center justify-center bg-gray-50"
                activeOpacity={0.8}
              >
                <Upload size={24} color="#9CA3AF" />
                <Text className="text-gray-500 mt-2">Tap to upload audio file</Text>
                <Text className="text-gray-400 text-sm mt-1">MP3, WAV, or M4A</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Quiz-specific fields */}
          {contentType === 'quiz' && (
            <View className="mb-6 p-4 bg-gray-50 rounded-lg">
              <Text className="text-gray-600 text-sm">
                📝 Quiz creation interface will include:
                {'\n'}• Multiple choice questions
                {'\n'}• Correct answer selection
                {'\n'}• Explanation text
                {'\n'}• Difficulty level
              </Text>
            </View>
          )}

          {/* Educational content-specific fields */}
          {contentType === 'educational' && (
            <View className="mb-6 p-4 bg-gray-50 rounded-lg">
              <Text className="text-gray-600 text-sm">
                📚 Educational content will include:
                {'\n'}• Rich text editor
                {'\n'}• Image uploads
                {'\n'}• Video embedding
                {'\n'}• Interactive elements
              </Text>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            className="w-full bg-blue-600 py-4 rounded-lg items-center justify-center mt-4"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold text-lg">Create Content</Text>
          </TouchableOpacity>

          {/* Coming Soon Notice */}
          <View className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <Text className="text-yellow-800 font-medium mb-1">🚧 Development in Progress</Text>
            <Text className="text-yellow-700 text-sm">
              This is a preview of the admin content management system. Full functionality will be available in the next update.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}