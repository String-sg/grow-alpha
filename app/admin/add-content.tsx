import { PodcastCreationSuccessModal } from '@/components/PodcastCreationSuccessModal';
import { useAuth } from '@/contexts/AuthContext';
import { adminService } from '@/services/adminService';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { ArrowLeft, CheckCircle, Minus, Plus, Upload } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
  const [quizJson, setQuizJson] = useState('');
  const [quizJsonError, setQuizJsonError] = useState<string | null>(null);
  const [quizJsonValid, setQuizJsonValid] = useState<boolean | null>(null);

  // File handling
  const [selectedAudioFile, setSelectedAudioFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);

  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState<{
    step: 'validation' | 'audio_upload' | 'image_upload' | 'database_creation' | 'complete';
    message: string;
  } | null>(null);

  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdPodcastTitle, setCreatedPodcastTitle] = useState('');

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

  const handleAudioFilePicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedAudioFile(result);
        console.log('Audio file selected:', result.assets[0].name);
      }
    } catch (error) {
      console.error('Error picking audio file:', error);
      Alert.alert('Error', 'Failed to select audio file. Please try again.');
    }
  };

  const handleImageFilePicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImageFile(result);
        console.log('Image file selected:', result.assets[0].name);
      }
    } catch (error) {
      console.error('Error picking image file:', error);
      Alert.alert('Error', 'Failed to select image file. Please try again.');
    }
  };

  const handleCreateAnother = () => {
    // Reset form
    setTitle('');
    setDescription('');
    setAuthor('');
    setCategory('');
    setImageUrl('');
    setQuizJson('');
    setSources([{ title: '', url: '', type: 'article', author: '', publishedDate: '' }]);
    setSelectedAudioFile(null);
    setSelectedImageFile(null);
    setSubmitProgress(null);
    setIsSubmitting(false);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setCreatedPodcastTitle('');
    setSubmitProgress(null);
    setIsSubmitting(false);
  };

  const validateQuizJson = (jsonString: string): { isValid: boolean; error?: string; parsed?: any } => {
    console.log('🧩 validateQuizJson called with:', jsonString.length, 'characters');

    if (!jsonString.trim()) {
      console.log('🧩 Empty quiz JSON, returning valid');
      return { isValid: true }; // Quiz is optional
    }

    try {
      console.log('🧩 Attempting to parse JSON...');
      const parsed = JSON.parse(jsonString);
      console.log('🧩 JSON parsed successfully:', parsed);

      if (!Array.isArray(parsed)) {
        return { isValid: false, error: 'Quiz must be an array of questions' };
      }

      for (let i = 0; i < parsed.length; i++) {
        const question = parsed[i];
        if (!question.question || typeof question.question !== 'string') {
          return { isValid: false, error: `Question ${i + 1}: Missing or invalid 'question' field` };
        }
        if (!Array.isArray(question.options) || question.options.length < 2) {
          return { isValid: false, error: `Question ${i + 1}: 'options' must be an array with at least 2 items` };
        }
        if (typeof question.answer !== 'number' || question.answer < 0 || question.answer >= question.options.length) {
          return { isValid: false, error: `Question ${i + 1}: 'answer' must be a valid index` };
        }
        if (!question.explanation || typeof question.explanation !== 'string') {
          return { isValid: false, error: `Question ${i + 1}: Missing or invalid 'explanation' field` };
        }
        if (typeof question.order !== 'number') {
          return { isValid: false, error: `Question ${i + 1}: Missing or invalid 'order' field` };
        }
      }

      return { isValid: true, parsed };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid JSON format';
      return {
        isValid: false,
        error: `JSON parsing error: ${errorMessage}. Please check for missing brackets, trailing commas, or syntax errors.`
      };
    }
  };

  const validateForm = (): { isValid: boolean; error?: string } => {
    if (!title.trim()) return { isValid: false, error: 'Title is required' };
    if (!description.trim()) return { isValid: false, error: 'Description is required' };
    if (!author.trim()) return { isValid: false, error: 'Author is required' };
    if (!selectedAudioFile) return { isValid: false, error: 'Audio file is required' };

    // Validate quiz JSON if provided
    console.log('🧩 Validating quiz JSON:', quizJson.length > 0 ? 'Has content' : 'Empty');
    const quizValidation = validateQuizJson(quizJson);
    console.log('🧩 Quiz validation result:', quizValidation);

    if (!quizValidation.isValid) {
      console.log('❌ Quiz validation failed:', quizValidation.error);
      return { isValid: false, error: `Quiz validation error: ${quizValidation.error}` };
    }

    return { isValid: true };
  };

  const handleSubmit = async () => {
    console.log('🚀 Create podcast button clicked');

    // Validate form
    console.log('🔍 Validating form...');
    const validation = validateForm();
    console.log('🔍 Validation result:', validation);

    if (!validation.isValid) {
      console.log('❌ Validation failed:', validation.error);
      Alert.alert('Validation Error', validation.error);
      return;
    }

    if (!selectedAudioFile?.assets?.[0]) {
      console.log('❌ No audio file selected');
      Alert.alert('Error', 'Please select an audio file');
      return;
    }

    if (!user?.email) {
      console.log('❌ No user email found');
      Alert.alert('Error', 'User email not found');
      return;
    }

    console.log('✅ All validations passed, starting submission...');

    setIsSubmitting(true);
    setSubmitProgress({ step: 'validation', message: 'Validating form data...' });

    try {
      // Parse quiz JSON if provided
      const quizValidation = validateQuizJson(quizJson);
      let quizQuestions = undefined;
      if (quizValidation.isValid && quizValidation.parsed) {
        quizQuestions = quizValidation.parsed;
      }

      const adminPodcastData = {
        title: title.trim(),
        description: description.trim(),
        author: author.trim(),
        category: category.trim() || undefined,
        imageUrl: selectedImageFile?.assets?.[0]?.uri || imageUrl || undefined,
        audioFileUri: selectedAudioFile.assets[0].uri,
        sources: sources
          .filter(source => source.title.trim() || source.url.trim())
          .map(source => ({
            title: source.title.trim(),
            url: source.url.trim(),
            type: source.type,
            author: source.author.trim() || undefined,
            published_date: source.publishedDate.trim() || undefined,
          })),
        quiz: quizQuestions,
      };

      setSubmitProgress({ step: 'audio_upload', message: 'Uploading audio file...' });

      console.log('📝 Creating podcast with data:', {
        ...adminPodcastData,
        audioFileUri: '[FILE_URI]', // Don't log the full URI
      });

      const result = await adminService.createPodcast(adminPodcastData, user.email);

      if (result.success) {
        setSubmitProgress({ step: 'complete', message: 'Podcast created successfully!' });

        // Store the podcast title and show success modal
        setCreatedPodcastTitle(title.trim());
        setShowSuccessModal(true);
      } else {
        console.error('❌ Podcast creation failed:', result);

        Alert.alert(
          'Creation Failed',
          result.error || 'An unknown error occurred during podcast creation.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Unexpected error during podcast creation:', error);

      Alert.alert(
        'Unexpected Error',
        'An unexpected error occurred. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
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
            Add more glow
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

          {/* Audio File Upload */}
          <View className="mb-6">
            <Text className="text-gray-700 text-base font-medium mb-2">Audio File *</Text>
            <TouchableOpacity
              onPress={handleAudioFilePicker}
              disabled={isSubmitting}
              className={`w-full py-4 border-2 border-dashed rounded-lg items-center justify-center ${
                selectedAudioFile
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-300 bg-gray-50'
              } ${isSubmitting ? 'opacity-50' : ''}`}
              activeOpacity={0.8}
            >
              {selectedAudioFile ? (
                <>
                  <CheckCircle size={24} color="#16A34A" />
                  <Text className="text-green-700 mt-2 font-medium">
                    {selectedAudioFile.assets?.[0]?.name || 'Audio file selected'}
                  </Text>
                  <Text className="text-green-600 text-sm mt-1">
                    {selectedAudioFile.assets?.[0]?.size
                      ? `${Math.round((selectedAudioFile.assets[0].size / 1024 / 1024) * 100) / 100} MB`
                      : 'Ready to upload'}
                  </Text>
                </>
              ) : (
                <>
                  <Upload size={24} color="#9CA3AF" />
                  <Text className="text-gray-500 mt-2">Tap to select audio file</Text>
                  <Text className="text-gray-400 text-sm mt-1">MP3, WAV, or M4A</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Quiz JSON Field */}
          <View className="mb-6">
            <Text className="text-gray-700 text-base font-medium mb-2">Quiz Questions (JSON)</Text>
            <Text className="text-gray-500 text-sm mb-3">
              Optional: Add quiz questions as JSON array. Each question should have: question, options, answer (index), explanation, and order.
            </Text>
            <TextInput
              value={quizJson}
              onChangeText={setQuizJson}
              placeholder={`[
  {
    "question": "What is the main topic?",
    "options": ["Option A", "Option B", "Option C"],
    "answer": 0,
    "explanation": "This is correct because...",
    "order": 1
  }
]`}
              multiline
              numberOfLines={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white font-mono text-sm"
              placeholderTextColor="#9CA3AF"
              textAlignVertical="top"
            />
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

          {/* Progress Indicator */}
          {submitProgress && (
            <View className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <View className="flex-row items-center mb-2">
                <ActivityIndicator size="small" color="#2563EB" />
                <Text className="text-blue-800 font-medium ml-2">
                  {submitProgress.step === 'validation' && 'Validating...'}
                  {submitProgress.step === 'audio_upload' && 'Uploading Audio...'}
                  {submitProgress.step === 'image_upload' && 'Uploading Image...'}
                  {submitProgress.step === 'database_creation' && 'Saving to Database...'}
                  {submitProgress.step === 'complete' && 'Complete!'}
                </Text>
              </View>
              <Text className="text-blue-700 text-sm">{submitProgress.message}</Text>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting}
            className={`w-full py-4 rounded-lg items-center justify-center mt-4 flex-row ${
              isSubmitting ? 'bg-gray-400' : 'bg-blue-600'
            }`}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <>
                <ActivityIndicator size="small" color="white" />
                <Text className="text-white font-semibold text-lg ml-2">Creating...</Text>
              </>
            ) : (
              <Text className="text-white font-semibold text-lg">Create Podcast</Text>
            )}
          </TouchableOpacity>

        </View>
      </ScrollView>

      {/* Success Modal */}
      <PodcastCreationSuccessModal
        visible={showSuccessModal}
        onClose={handleCloseSuccessModal}
        podcastTitle={createdPodcastTitle}
        onCreateAnother={handleCreateAnother}
      />
    </SafeAreaView>
  );
}