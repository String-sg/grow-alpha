import { EducationalCard } from '@/components/EducationalCard';
import { ProfileHeader } from '@/components/ProfileHeader';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { SegmentedControl } from '@/components/SegmentedControl';
import { WebScrollView } from '@/components/WebScrollView';
import { WeekCalendar } from '@/components/WeekCalendar';
import { useAuth } from '@/contexts/AuthContext';
import { EducationalContent, educationalContent, weeklyProgress } from '@/data/educational-content';
import { useAudio } from '@/hooks/useAudio';
import { contentService } from '@/services/contentService';
import { getFeedbackFormUrl } from '@/utils/feedback';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Linking, Platform, SafeAreaView, StatusBar, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const { currentPodcast, playContent } = useAudio();
  const { user } = useAuth();
  const [recentlyPlayed, setRecentlyPlayed] = useState<{ id: string; title: string; timestamp: number; imageUrl: string; category: string; author: string }[]>([]);
  const [allContent, setAllContent] = useState<EducationalContent[]>(educationalContent);
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  // Load hybrid content (database + static) on mount
  useEffect(() => {
    const loadContent = async () => {
      setIsLoadingContent(true);
      try {
        const hybridContent = await contentService.getAllContent(educationalContent);
        setAllContent(hybridContent);
      } catch (error) {
        console.error('Failed to load hybrid content:', error);
        // Keep static content as fallback
      } finally {
        setIsLoadingContent(false);
      }
    };

    loadContent();
  }, []);

  const handleContentPress = (content: EducationalContent) => {
    router.push(`/podcast/${content.id}`);
  };

  const handlePlayPress = async (content: EducationalContent) => {
    // Convert EducationalContent to Podcast format for audio system
    const podcastFormat = {
      id: content.id,
      title: content.title,
      description: content.description,
      imageUrl: content.imageUrl,
      audioUrl: content.audioUrl,
      duration: content.duration,
      author: content.author,
      sources: content.sources,
      category: content.category
    };
    
    // Add to recently played when content is played
    const newRecentlyPlayed = {
      id: content.id,
      title: content.title,
      timestamp: Date.now(),
      imageUrl: content.imageUrl,
      category: content.category || 'Unknown',
      author: content.author
    };
    
    setRecentlyPlayed(prev => {
      const existingIndex = prev.findIndex(item => item.id === content.id);
      const updated = existingIndex >= 0 
        ? [newRecentlyPlayed, ...prev.filter((_, index) => index !== existingIndex)]
        : [newRecentlyPlayed, ...prev];
      return updated.slice(0, 10); // Keep only last 10 items
    });
    
    // Use the existing audio system
    await playContent(podcastFormat);
  };





  // Calculate bottom padding based on mini player visibility
  const bottomPadding = currentPodcast ? 120 : 40;



  const filteredContent = allContent.filter(content =>
    !(content.progress && content.progress > 0 && content.progress < 1) && content.id !== '6'
  );

  const content = (
    <ProtectedRoute>
      <WebScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPadding }}
      >
        <StatusBar barStyle="dark-content" />
          {/* Header */}
          <ProfileHeader />
        
        {/* Navigation Bar */}
        <View className="px-6">
          <SegmentedControl activeSegment="home" />
        </View>
        
        {/* Week Calendar */}
        <View className="px-6">
          <WeekCalendar weekData={weeklyProgress} />
        </View>
        
        {/* Recently Learned Section - Only show if there's content */}
        {recentlyPlayed.length > 0 && (
          <View className="mt-8 mb-4">
            <View className="mx-6 mb-4">
              <Text className="text-black text-xl font-semibold">
                Recently learned
              </Text>
            </View>
            
            <View className="px-6">
              {recentlyPlayed.slice(0, 3).map((item) => {
                // Find the full content data to pass to EducationalCard
                const content = allContent.find(c => c.id === item.id);
                if (!content) return null;

                return (
                  <EducationalCard
                    key={item.id}
                    content={content}
                    onPress={() => handleContentPress(content)}
                    onPlayPress={() => handlePlayPress(content)}
                  />
                );
              })}
            </View>
          </View>
        )}

        {/* Recommended Section - Filter out duplicates from Recently Learned */}
        <View className="mt-4" style={{ marginBottom: bottomPadding }}>
          <View className="mx-6 mb-4">
            <Text className="text-black text-xl font-semibold">
              Recommended
            </Text>
          </View>
          
          <View className="px-6">
            {(() => {
              const recommendedContent = allContent.filter(content =>
                !recentlyPlayed.some(recent => recent.id === content.id)
              );
              
              if (recommendedContent.length === 0) {
                return (
                  <View className="text-center py-8">
                    <Text className="text-slate-600 text-base text-center">
                      You&apos;ve reached the end of the list. More content coming soon(:
                    </Text>
                  </View>
                );
              }

              return (
                <>
                  {recommendedContent.map((content) => (
                    <EducationalCard
                      key={content.id}
                      content={content}
                      onPress={() => handleContentPress(content)}
                      onPlayPress={() => handlePlayPress(content)}
                    />
                  ))}
                  
                  {/* Feedback link at bottom */}
                  <View className="mt-6 text-center">
                    <TouchableOpacity
                      onPress={() => {
                        const feedbackUrl = getFeedbackFormUrl(user?.email);
                        if (Platform.OS === 'web') {
                          window.open(feedbackUrl, '_blank');
                        } else {
                          Linking.openURL(feedbackUrl);
                        }
                      }}
                      activeOpacity={0.7}
                    >

                      <Text className="text-slate-500 text-sm underline">
                        share feedback
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              );
            })()}
          </View>
        </View>
      </WebScrollView>
    </ProtectedRoute>
  );

  if (Platform.OS === 'web') {
    return content;
  }

  return (
    <SafeAreaView className="flex-1">
      {content}
    </SafeAreaView>
  );
}

