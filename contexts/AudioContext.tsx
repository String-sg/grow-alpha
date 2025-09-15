import { mockQuizzes } from '@/data/quizzes';
import { Episode, PlaybackState, Podcast } from '@/types/podcast';
import { QuizProgress } from '@/types/quiz';
import { analytics } from '@/utils/analytics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import React, { createContext, ReactNode, useContext, useEffect, useReducer, useRef } from 'react';
import { Platform } from 'react-native';

// Audio context state interface
interface AudioContextState extends PlaybackState {
  error: string | null;
  sound: Audio.Sound | null;
  isBuffering: boolean;
}

// Audio context actions
type AudioAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SOUND'; payload: Audio.Sound | null }
  | { type: 'SET_PLAYING'; payload: boolean }
  | { type: 'SET_CURRENT_TIME'; payload: number }
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'SET_CURRENT_PODCAST'; payload: Podcast | null }
  | { type: 'SET_CURRENT_EPISODE'; payload: Episode | null }
  | { type: 'SET_PLAYBACK_RATE'; payload: number }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'SET_BUFFERING'; payload: boolean }
  | { type: 'RESET_PLAYBACK' };

// Audio context functions interface
interface AudioContextFunctions {
  playPodcast: (podcast: Podcast, episode?: Episode) => Promise<void>;
  pausePodcast: () => Promise<void>;
  resumePodcast: () => Promise<void>;
  seekTo: (positionMillis: number) => Promise<void>;
  setPlaybackRate: (rate: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  skipForward: (seconds?: number) => Promise<void>;
  skipBackward: (seconds?: number) => Promise<void>;
  stopPodcast: () => Promise<void>;
  getQuizProgress: (podcastId: string) => Promise<QuizProgress | null>;
  initializeQuizAvailability: (podcastId: string) => Promise<void>;
  getRecentlyPlayed: () => Promise<Array<{ id: string; title: string; timestamp: number; imageUrl: string; category: string; author: string }>>;
}

// Combined context interface
interface AudioContextType extends AudioContextState, AudioContextFunctions {}

// Initial state
const initialState: AudioContextState = {
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  currentPodcast: null,
  currentEpisode: null,
  isLoading: false,
  playbackRate: 1.0,
  volume: 1.0,
  error: null,
  sound: null,
  isBuffering: false,
};

// Reducer function
function audioReducer(state: AudioContextState, action: AudioAction): AudioContextState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_SOUND':
      return { ...state, sound: action.payload };
    case 'SET_PLAYING':
      return { ...state, isPlaying: action.payload };
    case 'SET_CURRENT_TIME':
      return { ...state, currentTime: action.payload };
    case 'SET_DURATION':
      return { ...state, duration: action.payload };
    case 'SET_CURRENT_PODCAST':
      return { ...state, currentPodcast: action.payload };
    case 'SET_CURRENT_EPISODE':
      return { ...state, currentEpisode: action.payload };
    case 'SET_PLAYBACK_RATE':
      return { ...state, playbackRate: action.payload };
    case 'SET_VOLUME':
      return { ...state, volume: action.payload };
    case 'SET_BUFFERING':
      return { ...state, isBuffering: action.payload };
    case 'RESET_PLAYBACK':
      return {
        ...initialState,
        playbackRate: state.playbackRate,
        volume: state.volume,
      };
    default:
      return state;
  }
}

// Create context
const AudioContext = createContext<AudioContextType | undefined>(undefined);

// Storage keys
const STORAGE_KEYS = {
  CURRENT_POSITION: 'audio_current_position',
  CURRENT_PODCAST: 'audio_current_podcast',
  CURRENT_EPISODE: 'audio_current_episode',
  PLAYBACK_RATE: 'audio_playback_rate',
  VOLUME: 'audio_volume',
  QUIZ_PROGRESS: 'quiz_progress',
  RECENTLY_PLAYED: 'audio_recently_played',
};

// Audio provider component
interface AudioProviderProps {
  children: ReactNode;
}

export function AudioProvider({ children }: AudioProviderProps) {
  const [state, dispatch] = useReducer(audioReducer, initialState);
  const isSeekingRef = useRef(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const completionTrackedRef = useRef<Set<string>>(new Set()); // Track which podcasts have had completion events fired
  
  // Update progress from sound status
  const updateProgress = (status: any) => {
    if (status.isLoaded && !isSeekingRef.current) {
      dispatch({ type: 'SET_CURRENT_TIME', payload: status.positionMillis || 0 });
      dispatch({ type: 'SET_DURATION', payload: status.durationMillis || 0 });
      dispatch({ type: 'SET_PLAYING', payload: status.isPlaying || false });
      dispatch({ type: 'SET_BUFFERING', payload: status.isBuffering || false });

      // Track podcast completion at 80% and 100%
      if (status.durationMillis > 0 && state.currentPodcast) {
        const progressPercentage = (status.positionMillis / status.durationMillis) * 100;
        const podcastId = state.currentPodcast.id;

        // Track 80% completion (for quiz unlocking)
        if (progressPercentage >= 80 && !completionTrackedRef.current.has(`${podcastId}_80`)) {
          completionTrackedRef.current.add(`${podcastId}_80`);
          analytics.trackPodcastProgress(podcastId, 80);
        }

        // Track 100% completion
        if (progressPercentage >= 100 && !completionTrackedRef.current.has(`${podcastId}_100`)) {
          completionTrackedRef.current.add(`${podcastId}_100`);
          analytics.trackPodcastComplete(podcastId, state.currentPodcast.title, status.durationMillis / 1000);
        }
      }
    }
  };

  // Start progress tracking
  const startProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    if (!soundRef.current) return;
    
    progressIntervalRef.current = setInterval(async () => {
      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        updateProgress(status);
        if (status.isLoaded && status.isPlaying) {
          saveCurrentState();
        }
      }
    }, 1000);
  };

  // Stop progress tracking
  const stopProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  // Initialize audio settings
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        // Set audio mode - platform specific configuration
        if (Platform.OS !== 'web') {
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            staysActiveInBackground: true,
            interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
            playThroughEarpieceAndroid: false,
          });
        } else {
          // Web-specific audio mode (simpler configuration)
          await Audio.setAudioModeAsync({
            staysActiveInBackground: false, // Web doesn't support background audio
          });
        }

        // Load saved settings
        const savedRate = await AsyncStorage.getItem(STORAGE_KEYS.PLAYBACK_RATE);
        const savedVolume = await AsyncStorage.getItem(STORAGE_KEYS.VOLUME);

        if (savedRate) {
          dispatch({ type: 'SET_PLAYBACK_RATE', payload: parseFloat(savedRate) });
        }
        if (savedVolume) {
          dispatch({ type: 'SET_VOLUME', payload: parseFloat(savedVolume) });
        }

        // Restore previous session if available
        await restorePreviousSession();
      } catch (error) {
        console.error('Failed to initialize audio:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to initialize audio system' });
      }
    };

    initializeAudio();

    return () => {
      // Cleanup on unmount
      stopProgressTracking();
      if (soundRef.current) {
        try {
          soundRef.current.unloadAsync();
        } catch (error) {
          console.error('Error unloading sound:', error);
        }
      }
    };
  }, []);

  // Restore previous session
  const restorePreviousSession = async () => {
    try {
      const savedPodcast = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_PODCAST);
      const savedEpisode = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_EPISODE);
      
      if (savedPodcast) {
        const podcast = JSON.parse(savedPodcast);
        dispatch({ type: 'SET_CURRENT_PODCAST', payload: podcast });
        
        if (savedEpisode) {
          const episode = JSON.parse(savedEpisode);
          dispatch({ type: 'SET_CURRENT_EPISODE', payload: episode });
        }

        // Force backdrop blur initialization for web after state update
        if (Platform.OS === 'web') {
          // Use requestAnimationFrame to ensure DOM has updated
          requestAnimationFrame(() => {
            try {
              const style = document.createElement('style');
              style.textContent = `
                .mini-player-blur {
                  backdrop-filter: blur(20px) !important;
                  -webkit-backdrop-filter: blur(20px) !important;
                }
              `;
              document.head.appendChild(style);
              console.log('Backdrop blur force-initialized for restored session');
              
              // Remove the temporary style after a short delay
              setTimeout(() => {
                document.head.removeChild(style);
              }, 1000);
            } catch (error) {
              console.log('Backdrop blur initialization not needed:', error);
            }
          });
        }
      }
    } catch (error) {
      console.error('Failed to restore previous session:', error);
    }
  };

  // Track recently played content
  const trackRecentlyPlayed = async (podcast: Podcast) => {
    try {
      const recentlyPlayedData = await AsyncStorage.getItem(STORAGE_KEYS.RECENTLY_PLAYED);
      let recentlyPlayed: Array<{ id: string; title: string; timestamp: number; imageUrl: string; category: string; author: string }> = [];
      
      if (recentlyPlayedData) {
        recentlyPlayed = JSON.parse(recentlyPlayedData);
      }
      
      // Remove if already exists (to avoid duplicates)
      recentlyPlayed = recentlyPlayed.filter(item => item.id !== podcast.id);
      
      // Add new item at the beginning
      const newItem = {
        id: podcast.id,
        title: podcast.title,
        timestamp: Date.now(),
        imageUrl: podcast.imageUrl,
        category: podcast.category,
        author: podcast.author
      };
      
      recentlyPlayed.unshift(newItem);
      
      // Keep only last 10 items to prevent storage bloat
      recentlyPlayed = recentlyPlayed.slice(0, 10);
      
      await AsyncStorage.setItem(STORAGE_KEYS.RECENTLY_PLAYED, JSON.stringify(recentlyPlayed));
    } catch (error) {
      console.error('Failed to track recently played:', error);
    }
  };

  // Get recently played content
  const getRecentlyPlayed = async (): Promise<Array<{ id: string; title: string; timestamp: number; imageUrl: string; category: string; author: string }>> => {
    try {
      const recentlyPlayedData = await AsyncStorage.getItem(STORAGE_KEYS.RECENTLY_PLAYED);
      if (recentlyPlayedData) {
        return JSON.parse(recentlyPlayedData);
      }
      return [];
    } catch (error) {
      console.error('Failed to get recently played:', error);
      return [];
    }
  };

  // Save current state to storage
  const saveCurrentState = async () => {
    try {
      if (state.currentPodcast) {
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_PODCAST, JSON.stringify(state.currentPodcast));
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_POSITION, state.currentTime.toString());
      }
      if (state.currentEpisode) {
        await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_EPISODE, JSON.stringify(state.currentEpisode));
      }
      await AsyncStorage.setItem(STORAGE_KEYS.PLAYBACK_RATE, state.playbackRate?.toString() || '1.0');
      await AsyncStorage.setItem(STORAGE_KEYS.VOLUME, state.volume?.toString() || '1.0');
    } catch (error) {
      console.error('Failed to save current state:', error);
    }
  };

  // Play podcast function
  const playPodcast = async (podcast: Podcast, episode?: Episode) => {
    try {
      console.log('Starting playPodcast for:', podcast.title);
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      // Stop current sound if playing
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        dispatch({ type: 'SET_SOUND', payload: null });
      }

      // Create new audio sound
      const audioUrl = episode?.audioUrl || podcast.audioUrl;
      console.log('Creating audio sound with audioUrl:', audioUrl);
      
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        {
          shouldPlay: true,
          rate: state.playbackRate || 1.0,
          shouldCorrectPitch: true, // Enable pitch correction
          volume: state.volume || 1.0,
          isLooping: false,
        }
      );
      
      soundRef.current = sound;
      dispatch({ type: 'SET_SOUND', payload: sound });

      // Reset completion tracking for new podcast
      completionTrackedRef.current.clear();

      dispatch({ type: 'SET_CURRENT_PODCAST', payload: podcast });
      dispatch({ type: 'SET_CURRENT_EPISODE', payload: episode || null });

      // Try to restore previous position if same content
      const savedPosition = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_POSITION);
      if (savedPosition && parseInt(savedPosition) > 0) {
        await sound.setPositionAsync(parseInt(savedPosition));
      }

      // Track this as recently played
      await trackRecentlyPlayed(podcast);
      
      // Initialize quiz as always available
      await initializeQuizAvailability(podcast.id);
      
      // Start progress tracking
      startProgressTracking();
      
      dispatch({ type: 'SET_LOADING', payload: false });
      console.log('Podcast started successfully with pitch correction enabled');
    } catch (error) {
      console.error('Failed to play podcast:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load audio. Please try again.' });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Pause podcast function
  const pausePodcast = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.pauseAsync();
        dispatch({ type: 'SET_PLAYING', payload: false });
        stopProgressTracking();
        await saveCurrentState();
      }
    } catch (error) {
      console.error('Failed to pause podcast:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to pause audio' });
    }
  };

  // Resume podcast function
  const resumePodcast = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.playAsync();
        dispatch({ type: 'SET_PLAYING', payload: true });
        startProgressTracking();
      } else if (state.currentPodcast) {
        // Sound doesn't exist, recreate it with the saved podcast
        console.log('Sound not found, recreating with saved podcast:', state.currentPodcast.title);
        await playPodcast(state.currentPodcast, state.currentEpisode || undefined);
      } else {
        console.warn('No sound and no current podcast to resume');
        dispatch({ type: 'SET_ERROR', payload: 'No audio to resume' });
      }
    } catch (error) {
      console.error('Failed to resume podcast:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to resume audio' });
    }
  };

  // Seek to position function
  const seekTo = async (positionMillis: number) => {
    try {
      if (soundRef.current && positionMillis >= 0) {
        isSeekingRef.current = true;
        await soundRef.current.setPositionAsync(positionMillis);
        
        // Update state immediately for responsive UI
        dispatch({ type: 'SET_CURRENT_TIME', payload: positionMillis });
        
        // Reset seeking flag after a brief delay
        setTimeout(() => {
          isSeekingRef.current = false;
        }, 100);
        
        await saveCurrentState();
      }
    } catch (error) {
      console.error('Failed to seek:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to seek to position' });
      isSeekingRef.current = false;
    }
  };

  // Set playback rate function with pitch correction
  const setPlaybackRate = async (rate: number) => {
    try {
      if (soundRef.current) {
        console.log(`Setting playback rate to ${rate}x with pitch correction enabled`);
        // Use setStatusAsync with shouldCorrectPitch for reliable pitch correction
        await soundRef.current.setStatusAsync({
          rate: rate,
          shouldCorrectPitch: true, // This ensures pitch correction works properly
        });
        console.log(`Playback rate set successfully to ${rate}x`);
      }
      dispatch({ type: 'SET_PLAYBACK_RATE', payload: rate });
      await AsyncStorage.setItem(STORAGE_KEYS.PLAYBACK_RATE, rate.toString());
    } catch (error) {
      console.error('Failed to set playback rate:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to change playback speed' });
    }
  };

  // Set volume function
  const setVolume = async (volume: number) => {
    try {
      if (soundRef.current) {
        await soundRef.current.setStatusAsync({ volume });
      }
      dispatch({ type: 'SET_VOLUME', payload: volume });
      await AsyncStorage.setItem(STORAGE_KEYS.VOLUME, volume.toString());
    } catch (error) {
      console.error('Failed to set volume:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to adjust volume' });
    }
  };

  // Skip forward function
  const skipForward = async (seconds: number = 15) => {
    const newPosition = Math.min(state.currentTime + (seconds * 1000), state.duration);
    await seekTo(newPosition);
  };

  // Skip backward function
  const skipBackward = async (seconds: number = 15) => {
    const newPosition = Math.max(state.currentTime - (seconds * 1000), 0);
    await seekTo(newPosition);
  };

  // Stop podcast function
  const stopPodcast = async () => {
    try {
      stopProgressTracking();
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        dispatch({ type: 'SET_SOUND', payload: null });
      }
      dispatch({ type: 'RESET_PLAYBACK' });
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_POSITION);
    } catch (error) {
      console.error('Failed to stop podcast:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to stop audio' });
    }
  };

  // Get quiz progress for a podcast
  const getQuizProgress = async (podcastId: string): Promise<QuizProgress | null> => {
    try {
      const progressData = await AsyncStorage.getItem(STORAGE_KEYS.QUIZ_PROGRESS);
      if (!progressData) return null;
      
      const progress: Record<string, QuizProgress> = JSON.parse(progressData);
      return progress[podcastId] || null;
    } catch (error) {
      console.error('Error getting quiz progress:', error);
      return null;
    }
  };

  // Initialize quiz availability (quizzes are always available)
  const initializeQuizAvailability = async (podcastId: string) => {
    try {
      // Find quiz for this podcast
      const quiz = mockQuizzes.find(q => q.podcastId === podcastId);
      if (!quiz) return;

      const progressData = await AsyncStorage.getItem(STORAGE_KEYS.QUIZ_PROGRESS);
      const progress: Record<string, QuizProgress> = progressData ? JSON.parse(progressData) : {};
      
      const existingProgress = progress[quiz.id];
      
      // Always ensure quiz is available (no unlock requirements)
      if (!existingProgress) {
        const newProgress: QuizProgress = {
          quizId: quiz.id,
          podcastId: podcastId,
          isUnlocked: true, // Always available
          isCompleted: false,
          bestScore: 0,
          attempts: 0,
          lastAttemptDate: undefined,
          unlockedAt: new Date()
        };
        
        progress[quiz.id] = newProgress;
        await AsyncStorage.setItem(STORAGE_KEYS.QUIZ_PROGRESS, JSON.stringify(progress));
        
        console.log(`Quiz initialized as available for podcast: ${podcastId}`);
      }
    } catch (error) {
      console.error('Error initializing quiz availability:', error);
    }
  };

  // Context value
  const contextValue: AudioContextType = {
    ...state,
    playPodcast,
    pausePodcast,
    resumePodcast,
    seekTo,
    setPlaybackRate,
    setVolume,
    skipForward,
    skipBackward,
    stopPodcast,
    getQuizProgress,
    initializeQuizAvailability,
    getRecentlyPlayed,
  };

  return (
    <AudioContext.Provider value={contextValue}>
      {children}
    </AudioContext.Provider>
  );
}

// Custom hook to use audio context
export function useAudioContext(): AudioContextType {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudioContext must be used within an AudioProvider');
  }
  return context;
}