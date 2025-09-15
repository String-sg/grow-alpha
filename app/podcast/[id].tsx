import { BottomSheet } from '@/components/BottomSheet';
import { Confetti } from '@/components/Confetti';
import { NavigationBar } from '@/components/NavigationBar';
import { NoteEditor } from '@/components/NoteEditor';
import { SimpleMarkdown } from '@/components/SimpleMarkdown';
import { SourceSheet } from '@/components/SourceSheet';
import { WebScrollView } from '@/components/WebScrollView';
import { useAudioContext } from '@/contexts/AudioContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNotes } from '@/contexts/NotesContext';
import { educationalContent, EducationalContent } from '@/data/educational-content';
import { mockQuizzes } from '@/data/quizzes';
import { getScriptByPodcastId } from '@/data/scripts';
import { useAudio } from '@/hooks/useAudio';
import { Note } from '@/types/notes';
import { analytics } from '@/utils/analytics';
import { getFeedbackFormUrl } from '@/utils/feedback';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { FileText, Lightbulb, Pause, Play, ScrollText, ThumbsDown, ThumbsUp } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Linking,
    Platform,
    ScrollView,
    Share,
    StatusBar,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

// Helper function to format time
const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Helper function to get topic colors based on category
const getTopicColors = (category: string) => {
  switch (category) {
    case 'Special Educational Needs':
      return {
        background: 'bg-purple-100',
        badge: 'bg-purple-200',
        text: 'text-purple-900',
        hex: '#7C3AED', // purple-700
        lightHex: '#E9D5FF' // purple-200
      };
    case 'Artificial Intelligence':
      return {
        background: 'bg-yellow-100',
        badge: 'bg-yellow-200',
        text: 'text-yellow-900',
        hex: '#CA8A04', // yellow-600
        lightHex: '#FEFCE8' // yellow-50
      };
    case 'Teacher mental health literacy':
      return {
        background: 'bg-teal-100',
        badge: 'bg-teal-200',
        text: 'text-teal-900',
        hex: '#0F766E', // teal-700
        lightHex: '#CCFBF1' // teal-100
      };
    default:
      return {
        background: 'bg-purple-100',
        badge: 'bg-purple-200',
        text: 'text-purple-900',
        hex: '#7C3AED',
        lightHex: '#E9D5FF'
      };
  }
};

export default function PodcastDetailsScreen() {
  const router = useRouter();
  const { id, from, topicId } = useLocalSearchParams<{ id: string; from?: string; topicId?: string }>();
  const { user } = useAuth(); // Get authenticated user info
  const [content, setContent] = useState<EducationalContent | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isNewNote, setIsNewNote] = useState(false);
  const [showSourceSheet, setShowSourceSheet] = useState(false);
  const [showScriptSheet, setShowScriptSheet] = useState(false);
  const [likeStatus, setLikeStatus] = useState<'liked' | 'disliked' | null>(null);
  const [showLikeConfetti, setShowLikeConfetti] = useState(false);
  
  // Generate random rotations between -4 and 4 degrees
  const randomRotation = () => Math.random() * 8 - 4;
  
  // Animation values for each note card - start with random rotation
  const note1Rotation = useSharedValue(randomRotation());
  const note2Rotation = useSharedValue(randomRotation());
  const note3Rotation = useSharedValue(randomRotation());
  const note4Rotation = useSharedValue(randomRotation());
  
  // Animation values for like button
  const likeButtonScale = useSharedValue(1);
  const likeButtonRotation = useSharedValue(0);
  
  const note1AnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${note1Rotation.value}deg` }],
    };
  });
  
  const note2AnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${note2Rotation.value}deg` }],
    };
  });
  
  const note3AnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${note3Rotation.value}deg` }],
    };
  });
  
  const note4AnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${note4Rotation.value}deg` }],
    };
  });
  
  // Function to reset rotation to 0 on click
  const resetNoteRotation = (rotationValue: any) => {
    rotationValue.value = withTiming(0, { duration: 200 });
  };
  
  // Function to restore random rotation
  const restoreNoteRotation = (rotationValue: any) => {
    rotationValue.value = withTiming(randomRotation(), { duration: 200 });
  };
  
  // Get screen dimensions for responsive layout
  const { width: screenWidth } = useWindowDimensions();
  const notesContainerPadding = 48; // 24px padding on each side (px-6)
  const noteGap = 16;
  
  // Max content width from WebScrollView (max-w-3xl = 768px)
  const maxContentWidth = 768;
  const contentWidth = Math.min(screenWidth, maxContentWidth);
  
  // Responsive breakpoints
  const isTablet = screenWidth >= 768;
  const notesPerRow = 2; // Always 2 columns for consistency
  
  // Calculate note card width considering the gaps between cards and max width constraint
  const totalGaps = (notesPerRow - 1) * noteGap;
  const availableWidth = contentWidth - notesContainerPadding - totalGaps;
  const noteCardWidth = Math.floor(availableWidth / notesPerRow);
  const noteCardHeight = isTablet ? 140 : 120; // Slightly taller on tablet

  const {
    isContentPlaying,
    isCurrentPodcast,
    playContent,
    isLoading,
    isContentBuffering,
  } = useAudio();

  const { currentPodcast: currentlyPlayingPodcast } = useAudioContext();
  const { getNotesForPodcast, createNote, updateNote, deleteNote } = useNotes();

  // Get topic colors based on content category
  const topicColors = content ? getTopicColors(content.category) : getTopicColors('');

  const loadNotes = useCallback(async (podcastId: string) => {
    const podcastNotes = await getNotesForPodcast(podcastId);
    setNotes(podcastNotes);
  }, [getNotesForPodcast]);

  useEffect(() => {
    if (id) {
      const foundContent = educationalContent.find(c => c.id === id);
      setContent(foundContent || null);
    }
  }, [id]);

  // Regenerate random rotations when notes change
  useEffect(() => {
    // Apply new random rotations with animation
    const rotationValues = [note1Rotation, note2Rotation, note3Rotation, note4Rotation];
    rotationValues.forEach((rotation, index) => {
      // Stagger the animations with slight delays
      setTimeout(() => {
        rotation.value = withTiming(randomRotation(), { duration: 300 });
      }, index * 50);
    });
  }, [notes.length]);

  // Load notes when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (id) {
        loadNotes(id);
      }
    }, [id, loadNotes])
  );

  const handlePlayPress = async () => {
    if (!content) return;

    // Track podcast play event
    analytics.trackPodcastPlay(content.id, content.title, content.category);

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
    await playContent(podcastFormat);
  };

  const handleQuizPress = () => {
    if (!content) return;

    // Track dive deeper click
    analytics.trackDiveDeeperClick(content.id, content.title);

    const quiz = mockQuizzes.find(q => q.podcastId === content.id);
    if (quiz) {
      router.push({
        pathname: `/quiz/${quiz.id}` as any,
        params: { podcastId: content.id }
      });
    }
  };

  const handleShare = async () => {
    if (!content) return;
    
    try {
      if (Platform.OS === 'web') {
        // Web platform handling
        const shareData = {
          title: content.title,
          text: `Check out this podcast: ${content.title} by ${content.author}`,
          url: window.location.href
        };

        if (navigator.share) {
          await navigator.share(shareData);
        } else {
          // Fallback for web platforms without Web Share API
          alert('Sharing is not available on this platform.');
        }
      } else {
        // Use React Native Share for mobile platforms
        const shareOptions = {
          message: `Check out this podcast: ${content.title} by ${content.author}`,
          title: content.title,
        };
        const result = await Share.share(shareOptions);
        
        // On Android, Share.share returns an object with action and activityType
        // On iOS, it returns an object with action
        // We don't need to handle the result unless there's an actual error
      }
    } catch (error: any) {
      console.error('Share error:', error);
      
      // Only show fallback for actual sharing not supported errors
      // Don't show error for user cancellation or other non-critical errors
      if (error?.message?.includes('not supported') || 
          error?.message?.includes('not available') ||
          error?.code === 'UNAVAILABLE') {
        alert('Sharing is not available on this platform.');
      }
      // For other errors (like user cancellation), silently ignore
    }
  };


  const formatNoteDate = (timestamp: number) => {
    const now = new Date();
    const noteDate = new Date(timestamp);
    const diffDays = Math.floor((now.getTime() - noteDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    
    return noteDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleNotePress = (noteId: string, index: number) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      // Reset rotation to 0 on click
      const rotationValues = [note1Rotation, note2Rotation, note3Rotation, note4Rotation];
      if (rotationValues[index]) {
        resetNoteRotation(rotationValues[index]);
      }
      
      setEditingNote(note);
      setIsNewNote(false);
      setShowNoteEditor(true);
    }
  };

  const handleNewNotePress = () => {
    // Reset rotation to 0 on click for new note card
    resetNoteRotation(note4Rotation);
    
    setEditingNote(null);
    setIsNewNote(true);
    setShowNoteEditor(true);
  };

  const handleSaveNote = async (title: string, content: string) => {
    if (!id) return;
    
    try {
      if (isNewNote) {
        await createNote(id, { title, content });
      } else if (editingNote) {
        await updateNote(editingNote.id, { title, content });
      }
      // Reload notes after saving
      await loadNotes(id);
    } catch (error) {
      console.error('Failed to save note:', error);
      throw error;
    }
  };

  const handleDeleteNote = async () => {
    if (!editingNote) return;
    
    try {
      await deleteNote(editingNote.id);
      setShowNoteEditor(false);
      // Reload notes after deletion
      if (id) await loadNotes(id);
    } catch (error) {
      console.error('Failed to delete note:', error);
      throw error;
    }
  };

  const handleCloseNoteEditor = () => {
    // Restore random rotation when closing editor
    if (editingNote) {
      const noteIndex = notes.findIndex(n => n.id === editingNote.id);
      if (noteIndex !== -1 && noteIndex < 3) {
        const rotationValues = [note1Rotation, note2Rotation, note3Rotation];
        if (rotationValues[noteIndex]) {
          restoreNoteRotation(rotationValues[noteIndex]);
        }
      }
    } else if (isNewNote) {
      // Restore rotation for new note card
      restoreNoteRotation(note4Rotation);
    }
    
    setShowNoteEditor(false);
    setEditingNote(null);
    setIsNewNote(false);
  };

  const handleLike = () => {
    const wasLiked = likeStatus === 'liked';
    setLikeStatus(wasLiked ? null : 'liked');
    
    if (!wasLiked) {
      // Trigger bouncy animation
      likeButtonScale.value = withSequence(
        withSpring(1.2, { damping: 2, stiffness: 200 }),
        withSpring(1, { damping: 3, stiffness: 300 })
      );
      
      likeButtonRotation.value = withSequence(
        withSpring(-10, { damping: 2, stiffness: 200 }),
        withSpring(10, { damping: 2, stiffness: 200 }),
        withSpring(0, { damping: 3, stiffness: 300 })
      );
      
      // Show confetti
      setShowLikeConfetti(true);
      setTimeout(() => setShowLikeConfetti(false), 1200);
    }
  };

  const handleDislike = () => {
    setLikeStatus(likeStatus === 'disliked' ? null : 'disliked');
  };
  
  const likeButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: likeButtonScale.value },
        { rotate: `${likeButtonRotation.value}deg` },
      ],
    };
  });

  if (!content) {
    return (
      <View className="flex-1 justify-center items-center">
        <StatusBar barStyle="dark-content" />
        <Text className="text-lg text-slate-600">
          Content not found
        </Text>
      </View>
    );
  }

  const isThisPodcastCurrent = isCurrentPodcast(content.id);
  const isThisPodcastPlaying = isContentPlaying(content.id);
  const isThisPodcastLoading = isThisPodcastCurrent && (isLoading || isContentBuffering);
  const hasQuiz = mockQuizzes.some(q => q.podcastId === content.id);
  
  // Check if mini player is visible (any podcast is currently loaded)
  const isMiniPlayerVisible = currentlyPlayingPodcast !== null;
  
  // Calculate dynamic padding for scroll content - match other screens
  const scrollPaddingBottom = isMiniPlayerVisible ? 120 : 40;
  
  // Handle scroll events (removed note animation trigger since notes are rotated by default)
  const handleScroll = (event: any) => {
    // Empty function - keeping for potential future scroll-based features
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View className="flex-1">
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        
        {/* Navigation Bar */}
        <NavigationBar 
          onBackPress={() => {
            if (from === 'topic' && topicId) {
              router.back();
            } else {
              router.replace('/');
            }
          }}
          showUploadButton={true}
          onUploadPress={handleShare}
          contentInfo={{
            title: content.title,
            subtitle: content.author,
            description: content.description,
            summary: content.summary,
          }}
          script={getScriptByPodcastId(content.id)?.content}
          sources={content.sources}
          onExamineSources={() => setShowSourceSheet(true)}
        />

        <WebScrollView 
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 76, paddingBottom: scrollPaddingBottom }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {/* Main Content Card */}
          <View className="mx-6 relative">
            {/* Main Card */}
            <View 
              className="bg-white rounded-3xl border border-slate-100 drop-shadow-sm"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 6,
                elevation: 4,
              }}
            >
              {/* Card Content */}
              <View className="p-6">
                {/* Podcast Image */}
                <View className="w-12 h-12 rounded-full overflow-hidden mb-4">
                  <Image
                    source={(() => {
                      if (content.category === 'Special Educational Needs') {
                        return require('@/assets/images/sen.svg');
                      } else if (content.category === 'Artificial Intelligence') {
                        return require('@/assets/images/learnAI.svg');
                      } else {
                        return require('@/assets/images/cover-album.png');
                      }
                    })()}
                    style={{ width: 48, height: 48 }}
                    resizeMode={(() => {
                      if (content.category === 'Special Educational Needs' || content.category === 'Artificial Intelligence') {
                        return 'contain';
                      } else {
                        return 'cover';
                      }
                    })()}
                  />
                </View>
                {/* Category Tag */}
                <View className="self-start mb-2">
                  <View className={`${topicColors.badge} rounded-full px-2 py-1`}>
                    <Text className={`${topicColors.text} text-xs font-semibold`}>
                      {content.category}
                    </Text>
                  </View>
                </View>

                {/* Title and Meta */}
                <Text className="text-slate-900 text-lg font-semibold mb-2 leading-7">
                  {content.title}
                </Text>
                <Text className="text-slate-600 text-sm mb-6">
                  By {content.author} · {content.publishedDate}
                </Text>

                {/* Action Buttons */}
                <View className="space-y-4">
                  {/* Play Button */}
                  <TouchableOpacity
                    onPress={handlePlayPress}
                    className="w-full bg-black rounded-full py-3 flex-row items-center justify-center"
                    activeOpacity={0.8}
                  >
                    {isThisPodcastLoading ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <>
                        {isThisPodcastPlaying ? (
                          <Pause size={16} color="white" strokeWidth={2} style={{ marginRight: 4 }} />
                        ) : (
                          <Play size={16} color="white" strokeWidth={2} style={{ marginRight: 4 }} />
                        )}
                        <Text className="text-white text-sm font-medium">
                          {isThisPodcastCurrent
                            ? (isThisPodcastPlaying ? 'Pause' : 'Resume')
                            : 'Play'
                          }
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>

                  {/* Take Quiz Button */}
                  {hasQuiz && (
                    <TouchableOpacity
                      onPress={handleQuizPress}
                      className="w-full bg-white rounded-full py-3 flex-row items-center justify-center border border-slate-200"
                      activeOpacity={0.8}
                    >
                      <Lightbulb
                        size={16}
                        color="#000"
                        strokeWidth={2}
                        style={{ marginRight: 4 }}
                      />
                      <Text className="text-black text-sm font-medium">
                        Take the quiz
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Description Section */}
          <View className="px-6 mt-6">
            <SimpleMarkdown className="px-1">
              {content.description}
            </SimpleMarkdown>
            
            {/* Action Buttons */}
            <View className="flex-row items-center justify-between mt-4">
              {/* Like/Dislike Buttons */}
              <View className="flex-row gap-3">
                {/* Like Button */}
                <View style={{ position: 'relative' }}>
                  <AnimatedTouchableOpacity 
                    onPress={handleLike}
                    className="p-3 rounded-full items-center justify-center"
                    style={[
                      {
                        backgroundColor: likeStatus === 'liked' ? topicColors.hex : topicColors.lightHex,
                      },
                      likeButtonAnimatedStyle
                    ]}
                  >
                    <ThumbsUp 
                      size={16} 
                      color={likeStatus === 'liked' ? '#FFFFFF' : topicColors.hex} 
                      strokeWidth={2} 
                    />
                  </AnimatedTouchableOpacity>
                  <Confetti isVisible={showLikeConfetti} />
                </View>
                
                {/* Dislike Button */}
                <TouchableOpacity 
                  onPress={handleDislike}
                  className="p-3 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: likeStatus === 'disliked' ? topicColors.hex : topicColors.lightHex,
                  }}
                >
                  <ThumbsDown 
                    size={16} 
                    color={likeStatus === 'disliked' ? '#FFFFFF' : topicColors.hex} 
                    strokeWidth={2} 
                  />
                </TouchableOpacity>
              </View>
              
              {/* Script/Source Buttons */}
              <View className="flex-row gap-3">
                {/* Script Button */}
                <TouchableOpacity
                  onPress={() => {
                    analytics.trackDiveDeeperAction('view_script', content?.id || '', content?.title || '');
                    setShowScriptSheet(true);
                  }}
                  className="px-4 py-3 rounded-full flex-row items-center gap-2"
                  style={{
                    backgroundColor: topicColors.lightHex,
                  }}
                >
                  <ScrollText size={16} color={topicColors.hex} strokeWidth={2} />
                  <Text className={`text-sm font-semibold ${topicColors.text}`}>Script</Text>
                </TouchableOpacity>
                
                {/* Source Button */}
                <TouchableOpacity
                  onPress={() => {
                    analytics.trackDiveDeeperAction('view_sources', content?.id || '', content?.title || '');
                    setShowSourceSheet(true);
                  }}
                  className="px-4 py-3 rounded-full flex-row items-center gap-2"
                  style={{
                    backgroundColor: topicColors.lightHex,
                  }}
                >
                  <FileText size={16} color={topicColors.hex} strokeWidth={2} />
                  <Text className={`text-sm font-semibold ${topicColors.text}`}>Sources</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Add Notes Section */}
          <View className="px-6 mt-8 mb-8">
            <Text className="text-black text-base font-medium mb-4 px-1">
              Add notes
            </Text>
            
            {/* Responsive Grid Container */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -noteGap/2 }}>
              {/* Existing Notes */}
              {notes.slice(0, 3).map((note, index) => {
                const animatedStyle = index === 0 ? note1AnimatedStyle :
                                    index === 1 ? note2AnimatedStyle :
                                    note3AnimatedStyle;
                
                return (
                  <View key={note.id} style={{ paddingHorizontal: noteGap/2, marginBottom: noteGap }}>
                    <TouchableOpacity 
                      className="relative" 
                      style={{ width: noteCardWidth, height: noteCardHeight }}
                      activeOpacity={0.8}
                      onPress={() => handleNotePress(note.id, index)}
                    >
                      <View 
                        className={`${topicColors.badge} rounded-3xl p-4 w-full h-full justify-between`}
                      >
                        <Text className="text-slate-600 text-xs">{formatNoteDate(note.createdAt)}</Text>
                        <Text className="text-slate-900 text-base font-medium leading-6" numberOfLines={2}>
                          {note.title}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                );
              })}



              {/* Notion Card - Primary */}
              <View style={{ paddingHorizontal: noteGap/2, marginBottom: noteGap }}>
                <TouchableOpacity 
                  className="relative" 
                  style={{ width: noteCardWidth, height: noteCardHeight }}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (Platform.OS === 'web') {
                      window.open('https://notion.new', '_blank');
                    } else {
                      Linking.openURL('https://notion.new');
                    }
                  }}
                >
                  <View 
                    className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-3xl p-4 w-full h-full justify-between"
                  >
                    <View className="bg-blue-100 rounded-full p-2 self-start">
                      <Text className="text-blue-700 text-xs font-bold">N</Text>
                    </View>
                    <Text className="text-blue-700 text-sm font-medium">
                      Create in Notion
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Google Docs Card - Secondary */}
              <View style={{ paddingHorizontal: noteGap/2, marginBottom: noteGap }}>
                <TouchableOpacity 
                  className="relative" 
                  style={{ width: noteCardWidth, height: noteCardHeight }}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (Platform.OS === 'web') {
                      window.open('https://doc.new', '_blank');
                    } else {
                      Linking.openURL('https://doc.new');
                    }
                  }}
                >
                  <View 
                    className="bg-slate-50 border border-slate-200 rounded-3xl p-4 w-full h-full justify-between"
                  >
                    <View className="bg-slate-200 rounded-full p-2 self-start">
                      <Text className="text-slate-600 text-xs font-bold">G</Text>
                    </View>
                    <Text className="text-slate-600 text-sm font-medium">
                      Create in Docs
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Next Steps Section */}
          <View className="px-6 mt-8 mb-8">
            <Text className="text-black text-xl font-medium mb-6 px-1">
              Next steps
            </Text>
            
            {/* Coming Soon Card */}
            <TouchableOpacity 
              className="bg-grey from-blue-50 to-purple-50 border border-blue-200 rounded-3xl p-6"
              onPress={() => {
                        // Build URL with user email if authenticated
        const fullUrl = getFeedbackFormUrl(user?.email);
                
                if (Platform.OS === 'web') {
                  window.open(fullUrl, '_blank');
                } else {
                  Linking.openURL(fullUrl);
                }
              }}
              activeOpacity={0.8}
            >
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-2">
                  <View className="bg-blue-100 rounded-full px-3 py-1">
                    <Text className="text-blue-700 text-xs font-semibold">
                      Coming Soon
                    </Text>
                  </View>
                </View>
                <View className="w-8 h-8 rounded-full items-center justify-center">
                  <Text className="text-blue-600 text-lg font-bold">→</Text>
                </View>
              </View>
              
              <Text className="text-slate-900 text-lg font-semibold leading-7 mb-3">
                What to learn next
              </Text>
              
              <Text className="text-slate-600 text-sm leading-6 mb-4">
                What would you like to see after completing a podcast? 
              </Text>
              
              <View className="flex-row">
                <Text className="text-blue-600 text-sm font-medium">
                  Share your feedback →
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </WebScrollView>
        
        {/* Note Editor Bottom Sheet */}
        <BottomSheet
          visible={showNoteEditor}
          onClose={handleCloseNoteEditor}
          height={600}
        >
          <NoteEditor
            note={editingNote}
            isNewNote={isNewNote}
            onSave={handleSaveNote}
            onDelete={isNewNote ? undefined : handleDeleteNote}
            onClose={handleCloseNoteEditor}
          />
        </BottomSheet>
        
        {/* Source Bottom Sheet */}
        <BottomSheet
          visible={showSourceSheet}
          onClose={() => setShowSourceSheet(false)}
          height={490}
        >
          <SourceSheet 
            sources={content.sources || []} 
            onClose={() => setShowSourceSheet(false)}
          />
        </BottomSheet>
        
        {/* Script Bottom Sheet */}
        <BottomSheet
          visible={showScriptSheet}
          onClose={() => setShowScriptSheet(false)}
          height={600}
        >
          <View className="flex-1 px-6 py-4">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4 pb-4 border-b border-slate-100">
              <View className="flex-1 mr-4">
                <Text className="text-black text-lg font-geist-medium">
                  {content.title}
                </Text>
                {content.author && (
                  <Text className="text-slate-500 text-sm mt-1">
                    by {content.author}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => setShowScriptSheet(false)}
                className="w-8 h-8 rounded-full bg-slate-100 items-center justify-center"
              >
                <Text className="text-base text-black">×</Text>
              </TouchableOpacity>
            </View>


            
            {/* Script Content */}
            {(() => {
              const script = getScriptByPodcastId(content.id);
              const { currentTime, duration, isPlaying, seekTo } = useAudioContext();
              
              if (!script) {
                return (
                  <View className="flex-1 items-center justify-center">
                    <Text className="text-slate-500 text-center">
                      No script available for this podcast
                    </Text>
                  </View>
                );
              }
              
              // Split script into sentences for highlighting
              const sentences = script.content.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
              const totalSentences = sentences.length;
              
              // Calculate which sentence should be highlighted based on current time
              const progress = duration > 0 ? currentTime / duration : 0;
              const currentSentenceIndex = Math.floor(progress * totalSentences);
              const highlightedIndex = Math.min(currentSentenceIndex, totalSentences - 1);
              
              // Function to handle sentence click and seek to timestamp
              const handleSentenceClick = (index: number) => {
                if (duration > 0) {
                  const sentenceProgress = index / totalSentences;
                  const targetTime = sentenceProgress * duration;
                  seekTo(targetTime);
                }
              };
              
              return (
                <ScrollView 
                  className="flex-1"
                  showsVerticalScrollIndicator={true}
                  contentContainerStyle={{ paddingBottom: 20 }}
                >
                  {sentences.map((sentence, index) => {
                    const isHighlighted = isPlaying && index === highlightedIndex;
                    
                    return (
                      <TouchableOpacity
                        key={index}
                        onPress={() => handleSentenceClick(index)}
                        activeOpacity={0.7}
                        className="mb-2"
                      >
                        <Text
                          className={`text-lg leading-7 text-justify ${
                            isHighlighted 
                              ? 'font-bold text-purple-700' 
                              : 'text-slate-700'
                          }`}
                          selectable
                        >
                          {sentence}
                          {index < sentences.length - 1 ? ' ' : ''}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              );
            })()}
          </View>
        </BottomSheet>
      </View>
    </>
  );
}