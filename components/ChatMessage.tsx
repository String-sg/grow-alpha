import { Icon } from '@/components/Icon';
import { aiUser } from '@/data/chat';
import { ChatColors } from '@/hooks/useThemeColor';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import Markdown from 'react-native-markdown-display';

interface ChatMessageProps {
  message: ChatMessageType;
  isLastMessage?: boolean;
}

export function ChatMessage({ message, isLastMessage = false }: ChatMessageProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  
  const isAI = message.userId === aiUser.id;
  const isTyping = message.type === 'typing';

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);


  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
      className={`mb-8 ${isLastMessage ? 'mb-10' : ''}`}
    >
      <View className={`flex-row ${isAI ? 'justify-start' : 'justify-end'}`}>
        {/* Message Content */}
        <View className={`max-w-[80%] ${isAI ? 'items-start' : 'items-end'}`}>
          {/* AI messages without bubble, User messages with bubble */}
          {isAI ? (
            // AI message - plain text
            <View className="px-1">
              {isTyping ? (
                // Typing indicator
                <View className="flex-row items-center space-x-2">
                  <View className="flex-row space-x-1">
                    {[0, 1, 2].map((index) => (
                      <Animated.View
                        key={index}
                        className="w-2 h-2 bg-slate-400 rounded-full"
                        style={{
                          backgroundColor: ChatColors.textMuted,
                          opacity: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.3, 1],
                          }),
                        }}
                      />
                    ))}
                  </View>
                  <Text className="text-sm italic" style={{ color: ChatColors.textMuted }}>
                    AI is typing...
                  </Text>
                </View>
              ) : (
                // Regular AI message - with markdown support
                <Markdown
                  style={{
                    body: {
                      fontSize: 16,
                      lineHeight: 24,
                      color: '#0f172a',
                    },
                    strong: {
                      fontWeight: 'bold',
                      color: '#0f172a',
                    },
                    bullet_list: {
                      marginVertical: 8,
                    },
                    list_item: {
                      marginVertical: 2,
                    },
                    paragraph: {
                      marginVertical: 4,
                      fontSize: 16,
                      lineHeight: 24,
                      color: '#0f172a',
                    },
                  }}
                >
                  {message.content}
                </Markdown>
              )}
            </View>
          ) : (
            // User message - with bubble
            <View
              className={`px-4 py-3 rounded-2xl bg-white rounded-br-md`}
              style={{
                backgroundColor: ChatColors.bubbleBackground,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <Text
                className="text-base leading-5"
                style={{ color: ChatColors.textPrimary }}
              >
                {message.content}
              </Text>
            </View>
          )}

        </View>
      </View>
    </Animated.View>
  );
}