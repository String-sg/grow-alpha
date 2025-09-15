import { formatDuration } from '@/data/podcasts';
import { useAudio } from '@/hooks/useAudio';
import { Podcast } from '@/types/podcast';
import { analytics } from '@/utils/analytics';
import React from 'react';
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from 'react-native';
import { Icon } from './Icon';

interface PodcastCardProps {
  podcast: Podcast;
  onPress?: () => void;
  showPlayButton?: boolean;
}

export const PodcastCard: React.FC<PodcastCardProps> = ({ 
  podcast, 
  onPress, 
  showPlayButton = true 
}) => {
  const { 
    isContentPlaying, 
    isCurrentPodcast, 
    playContent, 
    togglePlayPause, 
    isLoading,
    isContentBuffering 
  } = useAudio();

  const isThisPodcastCurrent = isCurrentPodcast(podcast.id);
  const isThisPodcastPlaying = isContentPlaying(podcast.id);
  const isThisPodcastLoading = isThisPodcastCurrent && (isLoading || isContentBuffering);

  const handlePlayPress = async (e: any) => {
    e.stopPropagation(); // Prevent triggering onPress

    if (isThisPodcastCurrent) {
      await togglePlayPause();
    } else {
      // Track podcast play event
      analytics.trackPodcastPlay(podcast.id, podcast.title, podcast.category || 'Unknown');
      await playContent(podcast);
    }
  };

  const handleCardPress = () => {
    if (onPress) {
      onPress();
    }
    // Card press should navigate to details, not play audio
  };

  return (
    <TouchableOpacity
      onPress={handleCardPress}
      className="bg-white rounded-lg border border-slate-200 p-4 mb-3 mx-4 active:opacity-80"
      activeOpacity={0.8}
    >
      <View className="flex-row items-start space-x-3">
        {/* Podcast Image with Play Button Overlay */}
        <View className="w-16 h-16 rounded-lg overflow-hidden bg-slate-200 relative">
          <Image
            source={{ uri: podcast.imageUrl }}
            className="w-full h-full"
            resizeMode="cover"
          />
          
          {/* Play/Pause Button Overlay */}
          {showPlayButton && (
            <TouchableOpacity
              onPress={handlePlayPress}
              className="absolute inset-0 bg-black/40 items-center justify-center"
              activeOpacity={0.8}
            >
              {isThisPodcastLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Icon
                  name={isThisPodcastPlaying ? "pause" : "play"}
                  size={20}
                  color="white"
                />
              )}
            </TouchableOpacity>
          )}
          
          {/* Currently Playing Indicator */}
          {isThisPodcastCurrent && (
            <View className="absolute top-1 right-1">
              <View className="w-2 h-2 bg-green-500 rounded-full" />
            </View>
          )}
        </View>
        
        {/* Podcast Info */}
        <View className="flex-1 space-y-1">
          <Text 
            className={`text-lg font-geist-semibold leading-tight ${
              isThisPodcastCurrent 
                ? 'text-blue-600' 
                : 'text-slate-900'
            }`}
            numberOfLines={2}
          >
            {podcast.title}
          </Text>
          
          <Text 
            className="text-sm text-slate-600 font-geist-medium"
            numberOfLines={1}
          >
            {podcast.author}
          </Text>
          
          <Text 
            className="text-sm text-slate-500 leading-relaxed"
            numberOfLines={2}
          >
            {podcast.description}
          </Text>
          
          {/* Duration Badge and Status */}
          <View className="flex-row items-center justify-between mt-2">
            <View className="flex-row items-center space-x-2">
              <View className="bg-blue-100 px-2 py-1 rounded-full">
                <Text className="text-xs font-geist-medium text-blue-800">
                  {formatDuration(podcast.duration)}
                </Text>
              </View>
              
              {/* Playing Status */}
              {isThisPodcastCurrent && (
                <View className="flex-row items-center space-x-1">
                  <View className={`w-2 h-2 rounded-full ${
                    isThisPodcastPlaying ? 'bg-green-500' : 'bg-slate-400'
                  }`} />
                  <Text className="text-xs text-slate-500">
                    {isThisPodcastLoading ? 'Loading...' : 
                     isThisPodcastPlaying ? 'Playing' : 'Paused'}
                  </Text>
                </View>
              )}
            </View>
            
            {/* Play Button (alternative position) */}
            {showPlayButton && (
              <TouchableOpacity
                onPress={handlePlayPress}
                className="w-8 h-8 items-center justify-center rounded-full bg-blue-500"
                activeOpacity={0.8}
              >
                {isThisPodcastLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Icon
                    name={isThisPodcastPlaying ? "pause" : "play"}
                    size={16}
                    color="white"
                  />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};