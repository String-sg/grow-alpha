import { ChatMessage } from '@/components/ChatMessage';
import { ContextLabel } from '@/components/ContextLabel';
import { EmailInputModal } from '@/components/EmailInputModal';
import { useAudioContext } from '@/contexts/AudioContext';
import { useChatContext } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { getScriptByPodcastId } from '@/data/scripts';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ChevronLeft, Plus, SendHorizontal } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function ChatScreen() {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category?: string }>();
  const { currentSession, isTyping, sendMessage, clearCurrentSession } = useChatContext();
  const { currentPodcast } = useAudioContext();
  const { user, isDemoMode, hasValidEmail, setDemoEmail } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);
  const [inputText, setInputText] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const messages = currentSession?.messages || [];

  // Get current topic from params, then podcast, then default
  const currentTopic = category || currentPodcast?.category || 'Special Educational Needs';
  console.log('[ChatScreen] Received category param:', category);
  console.log('[ChatScreen] CurrentPodcast category:', currentPodcast?.category);
  console.log('[ChatScreen] Final currentTopic:', currentTopic);
  
  // Check if there are any messages for the current topic
  const hasMessagesForCurrentTopic = messages.some(msg => 
    msg.context === currentTopic || 
    (currentTopic === 'Artificial Intelligence' && msg.context === 'AI') ||
    (currentTopic === 'AI' && msg.context === 'Artificial Intelligence')
  );
  
  // Filter messages for current topic
  const topicMessages = messages.filter(msg => 
    msg.context === currentTopic || 
    (currentTopic === 'Artificial Intelligence' && msg.context === 'AI') ||
    (currentTopic === 'AI' && msg.context === 'Artificial Intelligence')
  );
  
  // Generate podcast-specific suggested questions
  const getSuggestedQuestions = () => {
    if (currentPodcast) {
      // Generate podcast-specific questions based on title/content
      if (currentPodcast.title.toLowerCase().includes('adhd')) {
        return [
          "What are the main strategies discussed for supporting ADHD students?",
          "How can I differentiate between inattentive and hyperactive ADHD in my classroom?"
        ];
      } else if (currentPodcast.title.toLowerCase().includes('dyslexia')) {
        return [
          "What does the research say about how dyslexic students process reading?",
          "What are effective interventions for students with dyslexia?"
        ];
      } else if (currentPodcast.title.toLowerCase().includes('prompt injection')) {
        return [
          "What are the three prompt injection techniques mentioned?",
          "How can teachers stay aware of AI safety in classrooms?"
        ];
      } else if (currentPodcast.title.toLowerCase().includes('json')) {
        return [
          "How do JSON style guides help with consistent AI image generation?",
          "What's the difference between fixed and variable fields in prompts?"
        ];
      } else if (currentPodcast.title.toLowerCase().includes('songs')) {
        return [
          "What tools were mentioned for creating educational songs with AI?",
          "How does Targeted Memory Reactivation work with study music?"
        ];
      }
    }

    // Fallback to topic-based questions
    return currentTopic === 'Special Educational Needs' ? [
      "What are three quick strategies for teaching reading to a student with dyslexia in a mainstream classroom?",
      "How can I create a sensory-friendly classroom for students with autism spectrum disorder?"
    ] : (currentTopic === 'Artificial Intelligence' || currentTopic === 'AI') ? [
      "How can I use AI to create personalized learning materials?",
      "What are the best practices for using AI in education?"
    ] : [
      "What are effective strategies for teacher self-care?",
      "How can I recognize signs of burnout in myself or colleagues?"
    ];
  };

  const suggestedQuestions = getSuggestedQuestions();

  // Build podcast context for Gemini
  const buildPodcastContext = () => {
    if (!currentPodcast) return undefined;

    const podcastScript = getScriptByPodcastId(currentPodcast.id);
    return {
      podcastTitle: currentPodcast.title,
      podcastDescription: currentPodcast.description,
      podcastTranscript: podcastScript?.content,
      category: currentPodcast.category,
    };
  };

  const handleQuestionPress = (question: string) => {
    setInputText(question);
    setShowSuggestions(false);
    const podcastContext = buildPodcastContext();
    sendMessage(question, currentTopic, podcastContext);
  };

  const handleSend = () => {
    if (inputText.trim()) {
      const podcastContext = buildPodcastContext();
      sendMessage(inputText.trim(), currentTopic, podcastContext);
      setInputText('');
      setShowSuggestions(false);
    }
  };

  // Scroll to bottom when new messages arrive for current topic
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
    return () => clearTimeout(timer);
  }, [topicMessages]);

  // Reset suggestions and input when topic changes
  useEffect(() => {
    setShowSuggestions(true);
    setInputText('');
  }, [currentTopic]);


  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  // Handle email submission from modal
  const handleEmailSubmit = async (email: string) => {
    const success = await setDemoEmail(email);
    if (success) {
      setShowEmailModal(false);
    } else {
      throw new Error('Invalid email domain');
    }
  };

  // Check if user has access to chat
  const hasAccess = () => {
    if (!isDemoMode && user && user.email !== 'demo@moe.edu.sg') {
      // User is properly authenticated with OAuth
      return true;
    }

    if (isDemoMode && hasValidEmail) {
      // User is in demo mode with valid email
      return true;
    }

    return false;
  };

  // Show email modal if in demo mode without valid email
  useEffect(() => {
    console.log('Chat email modal check:', { isDemoMode, hasValidEmail, showEmailModal, user });
    if (isDemoMode && !hasValidEmail && !showEmailModal) {
      console.log('Showing email modal for demo mode');
      setShowEmailModal(true);
    }
  }, [isDemoMode, hasValidEmail, showEmailModal, user]);

  // For demo mode without valid email, show the main interface with modal
  if (isDemoMode && !hasValidEmail) {
    // Show the chat interface but with the email modal on top
    console.log('Demo mode without valid email - showing interface with modal');
  }

  // Check if user has access to chat (but allow demo mode to show interface)
  if (!hasAccess() && !(isDemoMode && !hasValidEmail)) {
    return (
      <View className="flex-1">
        <StatusBar style="dark" />
        <SafeAreaView className="flex-1 bg-slate-50">
          {/* Header */}
          <View className="bg-white border-b border-slate-200">
            <View className="flex-row items-center justify-between px-6 py-4">
              <TouchableOpacity
                onPress={handleBack}
                className="w-10 h-10 items-center justify-center rounded-full bg-slate-100"
                activeOpacity={0.7}
              >
                <ChevronLeft size={20} color="#000" />
              </TouchableOpacity>

              <View className="flex-1 flex-row items-center justify-center">
                <View className="flex-row items-center gap-2">
                  <View className="w-8 h-8 bg-black rounded-full items-center justify-center">
                    <Text className="text-white text-xs font-geist-semibold">AI</Text>
                  </View>
                  <View>
                    <Text className="text-white text-xs font-geist-semibold" style={{ color: '#000000' }}>Ask AI</Text>
                  </View>
                </View>
              </View>
              <View className="w-10" />
            </View>
          </View>

          {/* Login Required Content */}
          <View className="flex-1 justify-center items-center px-6">
            <View className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-sm">
              <View className="items-center mb-6">
                <View className="w-16 h-16 bg-slate-100 rounded-full items-center justify-center mb-4">
                  <Text className="text-2xl">🔒</Text>
                </View>
                <Text className="text-xl font-geist-semibold text-black mb-2 text-center">
                  Login Required
                </Text>
                <Text className="text-slate-600 text-center leading-6">
                  You need to login with your @moe.edu.sg account to use the AI chat feature.
                </Text>
              </View>

              <TouchableOpacity
                onPress={login}
                className="bg-black rounded-full py-4 px-6 mb-4"
                activeOpacity={0.9}
              >
                <Text className="text-white text-center font-geist-medium">
                  Login with Google
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleBack}
                className="py-3"
                activeOpacity={0.7}
              >
                <Text className="text-slate-500 text-center font-geist">
                  Go Back
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <StatusBar style="dark" />
      
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView 
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Content wrapper with max width */}
          <View className="flex-1 mx-auto w-full" style={{ maxWidth: 768 }}>
          {/* Header */}
          <View className="flex-row items-center justify-between px-6 pt-4 pb-4">
              <View className="flex-row items-center">
                <TouchableOpacity
                  onPress={handleBack}
                  className="w-10 h-10 items-center justify-center rounded-full bg-white"
                  activeOpacity={0.7}
                >
                  <ChevronLeft size={24} color="#000" strokeWidth={2} />
                </TouchableOpacity>
                
                <View className="ml-4">
                  <View className="bg-slate-950 px-2.5 py-0.5 rounded-md" style={{ backgroundColor: '#020617' }}>
                    <Text className="text-white text-xs font-geist-semibold" style={{ color: '#ffffff' }}>Ask AI</Text>
                  </View>
                </View>
              </View>
              
              {/* Clear chat button */}
              <TouchableOpacity
                onPress={() => clearCurrentSession()}
                className="px-3 py-2"
                activeOpacity={0.7}
              >
                <Text className="text-base font-geist-medium text-slate-600">Clear chat</Text>
              </TouchableOpacity>
            </View>

          {/* Content */}
          <ScrollView
            ref={scrollViewRef}
            className="flex-1"
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100, flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {showSuggestions && !hasMessagesForCurrentTopic ? (
              <View className="flex-1">
                <View className="mt-6">
                  <Text className="text-xl font-geist-medium mb-4 leading-7 text-black">
                    Hi Mr. Tan, here are some of the example questions relevant to {currentTopic === 'Artificial Intelligence' || currentTopic === 'AI' ? 'Artificial Intelligence' : currentTopic} topic.
                  </Text>
                  
                  <View className="space-y-3">
                    {suggestedQuestions.map((question, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleQuestionPress(question)}
                        onPressIn={() => setHoveredIndex(index)}
                        onPressOut={() => setHoveredIndex(null)}
                        className={`rounded-3xl p-4 mb-3 transition-colors ${
                          hoveredIndex === index ? 'bg-slate-100' : 'bg-white'
                        }`}
                        activeOpacity={0.9}
                      >
                        <Text className="text-base font-geist leading-6 text-slate-900">
                          &ldquo;{question}&rdquo;
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                
                {/* Context label at the bottom */}
                <View className="flex-1 justify-end pb-4">
                  <ContextLabel context={currentTopic} />
                </View>
              </View>
            ) : (
              <View className="flex-1">
                {!hasMessagesForCurrentTopic ? (
                  // Show context label at the end when no messages for current topic
                  <View className="flex-1 justify-end pb-4">
                    <ContextLabel context={currentTopic} />
                  </View>
                ) : (
                  // Show messages with context labels
                  <>
                    {/* Show context label at the top */}
                    <ContextLabel context={currentTopic} />
                    
                    <View className="space-y-4 mt-5">
                      {topicMessages.map((message, index) => (
                        <ChatMessage
                          key={message.id}
                          message={message}
                          isLastMessage={index === topicMessages.length - 1}
                        />
                      ))}
                    </View>
                    
                    {/* Show typing indicator */}
                    {isTyping && (
                      <ChatMessage
                        message={{
                          id: 'typing-indicator',
                          content: '',
                          userId: 'ai-assistant',
                          timestamp: new Date(),
                          type: 'typing',
                          status: 'delivered',
                          context: currentTopic,
                        }}
                      />
                    )}
                  </>
                )}
              </View>
            )}
          </ScrollView>

          {/* Floating Input Bar */}
          <View className="absolute bottom-6 left-6 right-6">
            <View 
              className="flex-row items-center rounded-full"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(10px)',

                borderWidth: 1,
                borderColor: 'rgba(226, 232, 240, 0.8)',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.05,
                shadowRadius: 4.4,
                elevation: 5,
                ...(Platform.OS === 'web' && {
                  boxShadow: '0px 2px 2px 0px rgba(255, 255, 255, 0.40) inset, 0px 4px 12px 0px rgba(0, 0, 0, 0.10) inset, 0px 4px 4.4px 0px rgba(0, 0, 0, 0.05)',
                }),
              }}
            >
              <TouchableOpacity
                className="w-12 h-12 m-3 items-center justify-center"
                activeOpacity={0.7}
              >
                <Plus size={24} color="#64748b" />
              </TouchableOpacity>
              
              <TextInput
                ref={inputRef}
                value={inputText}
                onChangeText={setInputText}
                placeholder={`Ask AI about ${currentTopic === 'Special Educational Needs' ? 'Special Educational Needs' : currentTopic === 'Artificial Intelligence' || currentTopic === 'AI' ? 'Artificial Intelligence' : 'teacher wellbeing'}`}
                placeholderTextColor="#64748b"
                className="flex-1 text-base font-geist mr-2"
                style={{ color: '#475569', outline: 'none' } as any}
                multiline={false}
                returnKeyType="send"
                onSubmitEditing={handleSend}
              />
              
              <TouchableOpacity
                onPress={handleSend}
                disabled={!inputText.trim()}
                className={`w-12 h-12 m-3 items-center justify-center rounded-full`}
                style={{ backgroundColor: inputText.trim() ? '#020617' : '#cbd5e1' }}
                activeOpacity={0.7}
              >
                <SendHorizontal size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Email Input Modal */}
      <EmailInputModal
        visible={showEmailModal}
        onSubmit={handleEmailSubmit}
        onCancel={() => {
          setShowEmailModal(false);
          router.replace('/');
        }}
      />
    </View>
  );
}