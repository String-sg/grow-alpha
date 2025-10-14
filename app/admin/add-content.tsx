import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { ArrowLeft, Upload, Plus, Minus } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface PodcastSource {
  title: string;
  url: string;
  type: 'research' | 'article' | 'study' | 'website' | 'book' | 'video' | 'intranet' | 'other';
  author: string;
  publishedDate: string;
}

export default function AddContentScreen() {
  const router = useRouter();
  const { isAdmin, user } = useAuth();

  // Podcast form fields based on actual Podcast interface
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sources, setSources] = useState<PodcastSource[]>([
    { title: '', url: '', type: 'article', author: '', publishedDate: '' }
  ]);

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

  const addSource = () => {
    setSources([...sources, { title: '', url: '', type: 'article', author: '', publishedDate: '' }]);
  };

  const removeSource = (index: number) => {
    if (sources.length > 1) {
      setSources(sources.filter((_, i) => i !== index));
    }
  };

  const updateSource = (index: number, field: keyof PodcastSource, value: string) => {
    const updatedSources = sources.map((source, i) =>
      i === index ? { ...source, [field]: value } : source
    );
    setSources(updatedSources);
  };

  const handleSubmit = () => {
    const podcastData = {
      title,
      description,
      author,
      category,
      imageUrl,
      sources: sources.filter(source => source.title || source.url), // Only include non-empty sources
      // Note: audioUrl and duration would be handled by file upload
    };

    Alert.alert(
      'Feature Coming Soon',
      'Podcast creation functionality will be available in the next update.\n\nPodcast Data:\n' +
      `Title: ${title}\nAuthor: ${author}\nCategory: ${category}\nSources: ${podcastData.sources.length} items`,
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
          {/* Title Field */}
          <View className="mb-6">
            <Text className="text-gray-700 text-base font-medium mb-2">Title *</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Enter podcast title"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Description Field */}
          <View className="mb-6">
            <Text className="text-gray-700 text-base font-medium mb-2">Description *</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Enter detailed podcast description and learning outcomes"
              multiline
              numberOfLines={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white"
              placeholderTextColor="#9CA3AF"
              textAlignVertical="top"
            />
          </View>

          {/* Author Field */}
          <View className="mb-6">
            <Text className="text-gray-700 text-base font-medium mb-2">Author *</Text>
            <TextInput
              value={author}
              onChangeText={setAuthor}
              placeholder="e.g., Kahhow, SDCD (Demo), Education Technology Team"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Category Field */}
          <View className="mb-6">
            <Text className="text-gray-700 text-base font-medium mb-2">Category</Text>
            <TextInput
              value={category}
              onChangeText={setCategory}
              placeholder="e.g., Artificial Intelligence, Student Well-being, Special Educational Needs"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Image URL Field */}
          <View className="mb-6">
            <Text className="text-gray-700 text-base font-medium mb-2">Cover Image URL</Text>
            <TextInput
              value={imageUrl}
              onChangeText={setImageUrl}
              placeholder="https://picsum.photos/400/400?random=1"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
            />
          </View>

          {/* Audio File Upload */}
          <View className="mb-6">
            <Text className="text-gray-700 text-base font-medium mb-2">Audio File *</Text>
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

          {/* Sources Section */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-gray-700 text-base font-medium">Sources & References</Text>
              <TouchableOpacity
                onPress={addSource}
                className="flex-row items-center px-3 py-1 bg-blue-100 rounded-lg"
                activeOpacity={0.8}
              >
                <Plus size={16} color="#2563EB" />
                <Text className="text-blue-600 ml-1 text-sm">Add Source</Text>
              </TouchableOpacity>
            </View>

            {sources.map((source, index) => (
              <View key={index} className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-gray-600 font-medium">Source {index + 1}</Text>
                  {sources.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removeSource(index)}
                      className="p-1"
                      activeOpacity={0.8}
                    >
                      <Minus size={16} color="#DC2626" />
                    </TouchableOpacity>
                  )}
                </View>

                <TextInput
                  value={source.title}
                  onChangeText={(value) => updateSource(index, 'title', value)}
                  placeholder="Source title"
                  className="w-full px-3 py-2 mb-2 border border-gray-300 rounded bg-white text-gray-900"
                  placeholderTextColor="#9CA3AF"
                />

                <TextInput
                  value={source.url}
                  onChangeText={(value) => updateSource(index, 'url', value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 mb-2 border border-gray-300 rounded bg-white text-gray-900"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                />

                <View className="flex-row gap-2 mb-2">
                  <TextInput
                    value={source.author}
                    onChangeText={(value) => updateSource(index, 'author', value)}
                    placeholder="Author"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
                    placeholderTextColor="#9CA3AF"
                  />

                  <TextInput
                    value={source.publishedDate}
                    onChangeText={(value) => updateSource(index, 'publishedDate', value)}
                    placeholder="2025"
                    className="w-20 px-3 py-2 border border-gray-300 rounded bg-white text-gray-900"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View className="flex-row flex-wrap gap-2">
                  {['article', 'website', 'research', 'study', 'book', 'video', 'intranet', 'other'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => updateSource(index, 'type', type)}
                      className={`px-3 py-1 rounded-full ${
                        source.type === type
                          ? 'bg-blue-600'
                          : 'bg-gray-200'
                      }`}
                      activeOpacity={0.8}
                    >
                      <Text className={`text-xs ${
                        source.type === type ? 'text-white' : 'text-gray-600'
                      }`}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            className="w-full bg-blue-600 py-4 rounded-lg items-center justify-center mt-4"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold text-lg">Create Podcast</Text>
          </TouchableOpacity>

          {/* Coming Soon Notice */}
          <View className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <Text className="text-yellow-800 font-medium mb-1">🚧 Development in Progress</Text>
            <Text className="text-yellow-700 text-sm">
              This podcast creation form matches your existing data structure. Features coming soon:
              {'\n'}• Audio file upload and processing
              {'\n'}• Automatic duration detection
              {'\n'}• Database storage integration
              {'\n'}• ID generation and validation
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}