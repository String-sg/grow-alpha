import { ChatMessage } from '@/components/ChatMessage';
import { ContextLabel } from '@/components/ContextLabel';
import { useAudioContext } from '@/contexts/AudioContext';
import { useChatContext } from '@/contexts/ChatContext';
import { getScriptByPodcastId } from '@/data/scripts';
import { mockPodcasts } from '@/data/podcasts';
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
  const scrollViewRef = useRef<ScrollView>(null);
  const [inputText, setInputText] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
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
    </View>
  );
}