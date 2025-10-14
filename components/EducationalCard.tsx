import { useAuth } from '@/contexts/AuthContext';
import { EducationalContent, getDaysAgo } from '@/data/educational-content';
import { useAudio } from '@/hooks/useAudio';
import { Trash2 } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import CircularProgress from 'react-native-circular-progress-indicator';
import { Icon } from './Icon';

interface EducationalCardProps {
  content: EducationalContent;
  onPress?: () => void;
  onPlayPress?: () => void;
  onDelete?: () => void;
  isFromDatabase?: boolean;
}

export const EducationalCard: React.FC<EducationalCardProps> = ({
  content,
  onPress,
  onPlayPress,
  onDelete,
  isFromDatabase
}) => {
  // Ensure yellow classes are included: bg-yellow-50 bg-yellow-100 bg-yellow-200 bg-yellow-300 text-yellow-900
  const {
    isContentPlaying,
    isCurrentPodcast,
    isLoading,
    isContentBuffering,
    getFormattedRemainingTime,
    getProgress,
    duration
  } = useAudio();

  const { isAdmin } = useAuth();

  const isThisPodcastCurrent = isCurrentPodcast(content.id);
  const isThisPodcastPlaying = isContentPlaying(content.id);
  const isThisPodcastLoading = isThisPodcastCurrent && (isLoading || isContentBuffering);

  // Helper function to get actual progress for this content
  const getActualProgress = () => {
    if (isThisPodcastCurrent && duration > 0) {
      // Use live progress from audio player
      return getProgress() / 100; // Convert percentage to 0-1 range
    }
    // Fall back to static progress from content data
    return content.progress || 0;
  };

  // Helper function to get actual remaining time for this content
  const getActualTimeLeft = () => {
    if (isThisPodcastCurrent && duration > 0) {
      // Use live remaining time from audio player and add "left" suffix
      const remainingTime = getFormattedRemainingTime();
      return remainingTime ? `${remainingTime} left` : content.timeLeft;
    }
    
    // Calculate remaining time based on content duration and progress
    const progress = content.progress || 0;
    const totalDurationMs = content.duration;
    
    // If no progress (unplayed), show total duration
    if (progress === 0) {
      const totalMinutes = Math.floor(totalDurationMs / 60000);
      const hours = Math.floor(totalMinutes / 60);
      
      if (hours > 0) {
        const remainingMinutes = totalMinutes % 60;
        return `${hours}h ${remainingMinutes}m`;
      }
      return `${totalMinutes}m`;
    }
    
    const remainingMs = totalDurationMs * (1 - progress);
    
    // Format remaining time
    const totalMinutes = Math.floor(remainingMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    
    if (totalMinutes <= 0) {
      return 'Completed';
    }
    
    if (hours > 0) {
      const remainingMinutes = totalMinutes % 60;
      return `${hours}h ${remainingMinutes}m left`;
    }
    return `${totalMinutes}m left`;
  };

  const handlePlayPress = (e: any) => {
    e.stopPropagation();
    if (onPlayPress) {
      onPlayPress();
    }
  };

  const renderProgressRing = () => {
    const progress = getActualProgress();
    const progressPercentage = Math.min(100, Math.max(0, progress * 100)); // Ensure 0-100 range
    
    return (
      <CircularProgress 
        value={progressPercentage} 
        radius={12}
        duration={300}
        activeStrokeWidth={2}
        inActiveStrokeWidth={2}
        activeStrokeColor="#000000"
        inActiveStrokeColor="#e5e7eb"
        showProgressValue={false}
        clockwise={true}
        strokeLinecap="round"
      />
    );
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-3xl drop-shadow-sm mb-4 border border-slate-100"
      activeOpacity={0.8}
    >
      {/* Header Section */}
      <View className="pt-6 pb-1 px-6">
        <View className="flex-col gap-1">
          {/* Category Badge and Delete Button Row */}
          <View className="flex-row items-start justify-between">
            <View className={`${content.badgeColor} self-start rounded-md px-2.5 py-0.5`}>
              <Text className={`${content.textColor} text-xs font-geist-semibold`}>
                {content.category}
              </Text>
            </View>

            {/* Admin Delete Button */}
            {isAdmin && isFromDatabase && onDelete && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="w-8 h-8 items-center justify-center rounded-full bg-red-50 border border-red-200"
                activeOpacity={0.7}
              >
                <Trash2 size={16} color="#dc2626" />
              </TouchableOpacity>
            )}
          </View>

          {/* Title */}
          <Text className="text-slate-950 text-xl font-geist-medium leading-7 mt-1">
            {content.title}
          </Text>

          {/* Author and Date */}
          <View className="flex-row items-center py-1.5 mt-1">
            <Text className="text-slate-600 text-sm font-geist">
              {content.author} • {getDaysAgo(content.createdAt)}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Section */}
      <View className="px-4 pb-4">
        <View className="flex-row items-center gap-3">
          {/* Play Button */}
          <TouchableOpacity
            onPress={handlePlayPress}
            className="bg-white rounded-full px-5 py-3 flex-row items-center gap-1 drop-shadow-sm border border-black/10"
            activeOpacity={0.8}
          >
            {isThisPodcastLoading ? (
              <ActivityIndicator size="small" color="#000000" />
            ) : (
              <Icon 
                name={isThisPodcastPlaying ? "pause" : "play"} 
                size={16} 
                color="#000000" 
              />
            )}
            <Text className="text-black text-sm font-geist-medium">
              {isThisPodcastLoading
                ? 'Loading...'
                : isThisPodcastCurrent
                ? isThisPodcastPlaying
                  ? 'Pause'
                  : 'Resume'
                : (content.progress && content.progress > 0) ? 'Resume' : 'Play'}
            </Text>
          </TouchableOpacity>
          
          {/* Progress and Time */}
          <View className="flex-row items-center gap-2">
            {renderProgressRing()}
            <Text className="text-slate-600 text-sm font-geist">
              {getActualTimeLeft()}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};