import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface CompletedMLU {
  podcastId: string;
  podcastTitle: string;
  quizId: string;
  completedAt: Date;
  score: number;
}

interface MLUStats {
  completedMLUs: number;
  consumedMLUs: number;
  streak: number;
  completedList: CompletedMLU[];
}

interface MLUContextType {
  stats: MLUStats;
  incrementCompletedMLUs: (podcastId: string, podcastTitle: string, quizId: string, score: number) => void;
  refreshStats: () => Promise<void>;
}

const MLUContext = createContext<MLUContextType | undefined>(undefined);

const QUIZ_PROGRESS_KEY = 'quiz_progress';
const MLU_SESSION_KEY = 'mlu_session_stats';

export function MLUProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = useState<MLUStats>({
    completedMLUs: 4,
    consumedMLUs: 12,
    streak: 3,
    completedList: []
  });

  const [sessionCompletions, setSessionCompletions] = useState<CompletedMLU[]>([]);

  const refreshStats = async () => {
    try {
      // Get persistent quiz completions
      const progressData = await AsyncStorage.getItem(QUIZ_PROGRESS_KEY);
      const progress = progressData ? JSON.parse(progressData) : {};

      // Count completed quizzes from persistent storage
      const persistentCompletions = Object.values(progress).filter(
        (p: any) => p.isCompleted
      ).length;

      // Get session completions
      const sessionData = await AsyncStorage.getItem(MLU_SESSION_KEY);
      const currentSession = sessionData ? JSON.parse(sessionData) : { completions: [] };

      setSessionCompletions(currentSession.completions || []);

      setStats(prev => ({
        ...prev,
        completedMLUs: persistentCompletions + (currentSession.completions?.length || 0),
        completedList: currentSession.completions || []
      }));
    } catch (error) {
      console.error('Error refreshing MLU stats:', error);
    }
  };

  const incrementCompletedMLUs = async (podcastId: string, podcastTitle: string, quizId: string, score: number) => {
    try {
      // Create new completion entry
      const newCompletion: CompletedMLU = {
        podcastId,
        podcastTitle,
        quizId,
        completedAt: new Date(),
        score
      };

      // Update session storage
      const sessionData = await AsyncStorage.getItem(MLU_SESSION_KEY);
      const currentSession = sessionData ? JSON.parse(sessionData) : { completions: [] };

      if (!currentSession.completions) {
        currentSession.completions = [];
      }

      currentSession.completions.push(newCompletion);
      await AsyncStorage.setItem(MLU_SESSION_KEY, JSON.stringify(currentSession));

      setSessionCompletions(currentSession.completions);

      // Update state immediately
      setStats(prev => ({
        ...prev,
        completedMLUs: prev.completedMLUs + 1,
        completedList: [...prev.completedList, newCompletion]
      }));
    } catch (error) {
      console.error('Error incrementing MLU completions:', error);
    }
  };

  useEffect(() => {
    refreshStats();
  }, []);

  return (
    <MLUContext.Provider value={{ stats, incrementCompletedMLUs, refreshStats }}>
      {children}
    </MLUContext.Provider>
  );
}

export function useMLU() {
  const context = useContext(MLUContext);
  if (context === undefined) {
    throw new Error('useMLU must be used within a MLUProvider');
  }
  return context;
}