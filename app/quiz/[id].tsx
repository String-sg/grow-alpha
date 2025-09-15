import { AnswerFeedback } from '@/components/AnswerFeedback';
import { BottomSheet } from '@/components/BottomSheet';
import { Icon } from '@/components/Icon';
import { QuizQuestion } from '@/components/QuizQuestion';
import { useAudioContext } from '@/contexts/AudioContext';
import { mockQuizzes } from '@/data/quizzes';
import {
  Quiz,
  QuizAnswer,
  QuizAttempt,
  QuizProgress,
  QuizResult
} from '@/types/quiz';
import { analytics } from '@/utils/analytics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const QUIZ_STORAGE_KEY = 'quiz_attempts';
const QUIZ_PROGRESS_KEY = 'quiz_progress';

export default function QuizScreen() {
  const { id, podcastId } = useLocalSearchParams<{ id: string; podcastId?: string }>();
  const { currentPodcast } = useAudioContext();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  // const [showResult, setShowResult] = useState(false); // Unused for now
  const [isLoading, setIsLoading] = useState(true);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [quizStartTime] = useState(Date.now());
  const [showAnswerSheet, setShowAnswerSheet] = useState(false);

  const loadQuiz = useCallback(async () => {
    try {
      const foundQuiz = mockQuizzes.find(q => q.id === id);
      if (!foundQuiz) {
        Alert.alert('Error', 'Quiz not found', [
          { text: 'OK', onPress: () => router.back() }
        ]);
        return;
      }

      // Quizzes are always available - no unlock check needed

      // Get attempt number for this quiz
      const existingAttempts = await getQuizAttempts(foundQuiz.id);
      const attemptNumber = existingAttempts.length + 1;

      // Track quiz attempt
      analytics.trackQuizAttempt(foundQuiz.podcastId, foundQuiz.title, attemptNumber);

      setQuiz(foundQuiz);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading quiz:', error);
      Alert.alert('Error', 'Failed to load quiz', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  }, [id]);

  useEffect(() => {
    loadQuiz();
  }, [id, loadQuiz]);

  const handleOptionSelect = (optionId: string) => {
    if (!quiz || showAnswerSheet) return;

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const selectedOption = currentQuestion.options.find(opt => opt.id === optionId);

    if (!selectedOption) return;

    // Allow changing selection - store the new selection
    setAnswers(prev => {
      // Remove any existing answer for this question
      const filtered = prev.filter(a => a.questionId !== currentQuestion.id);
      return [...filtered, {
        questionId: currentQuestion.id,
        selectedOptionId: optionId,
        isCorrect: selectedOption.isCorrect,
        timeSpent: 0 // Will be calculated when checking answer
      }];
    });
  };

  const handleCheckAnswer = () => {
    if (!quiz || !hasSelectedAnswer) return;

    const currentAnswer = answers.find(a => a.questionId === quiz.questions[currentQuestionIndex].id);
    if (!currentAnswer) return;

    // Update the answer with the actual time spent
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    const updatedAnswers = answers.map(a => 
      a.questionId === currentAnswer.questionId 
        ? { ...a, timeSpent } 
        : a
    );
    setAnswers(updatedAnswers);

    // Show answer feedback in bottom sheet
    setShowAnswerSheet(true);
  };

  const handleContinueFromFeedback = () => {
    setShowAnswerSheet(false);
    
    // Move to next question or finish quiz
    setTimeout(() => {
      if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setQuestionStartTime(Date.now());
      } else {
        finishQuiz(answers);
      }
    }, 300); // Small delay for smooth animation
  };

  const finishQuiz = async (finalAnswers: QuizAnswer[]) => {
    if (!quiz) return;

    try {
      const correctAnswers = finalAnswers.filter(answer => answer.isCorrect).length;
      const scorePercentage = Math.round((correctAnswers / quiz.questions.length) * 100);
      const totalTimeSpent = Math.floor((Date.now() - quizStartTime) / 1000);

      const attempt: QuizAttempt = {
        id: `attempt_${Date.now()}`,
        quizId: quiz.id,
        podcastId: quiz.podcastId,
        answers: finalAnswers,
        score: scorePercentage,
        totalQuestions: quiz.questions.length,
        completedAt: new Date(),
        timeSpent: totalTimeSpent
      };

      const result: QuizResult = {
        attempt,
        quiz,
        correctAnswers,
        totalQuestions: quiz.questions.length,
        scorePercentage,
        passingScore: 70,
        passed: scorePercentage >= 70,
        feedback: generateFeedback(scorePercentage)
      };

      // Get attempt number for analytics
      const existingAttempts = await getQuizAttempts(quiz.id);
      const attemptNumber = existingAttempts.length + 1;

      // Track quiz completion
      analytics.trackQuizComplete(quiz.podcastId, scorePercentage, scorePercentage >= 70, attemptNumber);

      // Save attempt
      await saveQuizAttempt(attempt);

      // Update progress
      await updateQuizProgress(quiz.id, scorePercentage);

      // Navigate to results
      router.push({
        pathname: '/quiz/result',
        params: { 
          resultData: JSON.stringify(result),
          podcastId: quiz?.podcastId || ''
        }
      });
    } catch (error) {
      console.error('Error finishing quiz:', error);
      Alert.alert('Error', 'Failed to save quiz results');
    }
  };

  const saveQuizAttempt = async (attempt: QuizAttempt) => {
    try {
      const existingData = await AsyncStorage.getItem(QUIZ_STORAGE_KEY);
      const attempts: QuizAttempt[] = existingData ? JSON.parse(existingData) : [];
      attempts.push(attempt);
      await AsyncStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(attempts));
    } catch (error) {
      console.error('Error saving quiz attempt:', error);
    }
  };

  const updateQuizProgress = async (quizId: string, score: number) => {
    try {
      const progressData = await AsyncStorage.getItem(QUIZ_PROGRESS_KEY);
      const progress: Record<string, QuizProgress> = progressData ? JSON.parse(progressData) : {};
      
      const currentProgress = progress[quizId] || {
        quizId,
        podcastId: quiz?.podcastId || '',
        isUnlocked: true,
        isCompleted: false,
        bestScore: 0,
        attempts: 0
      };

      currentProgress.isCompleted = true;
      currentProgress.bestScore = Math.max(currentProgress.bestScore, score);
      currentProgress.attempts += 1;
      currentProgress.lastAttemptDate = new Date();

      progress[quizId] = currentProgress;
      await AsyncStorage.setItem(QUIZ_PROGRESS_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error('Error updating quiz progress:', error);
    }
  };

  const generateFeedback = (score: number): string => {
    if (score >= 90) {
      return "Excellent! You have a thorough understanding of the podcast content.";
    } else if (score >= 80) {
      return "Great job! You understood most of the key concepts discussed.";
    } else if (score >= 70) {
      return "Good work! You passed the quiz with a solid understanding.";
    } else if (score >= 60) {
      return "Not bad, but you might want to listen to the podcast again for better comprehension.";
    } else {
      return "Consider re-listening to the podcast to better understand the content before retaking the quiz.";
    }
  };

  const handleExitQuiz = () => {
    try {
      console.log('Exit quiz button pressed');
      
      // If not on first question, go to previous question
      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(prev => prev - 1);
        setQuestionStartTime(Date.now());
        // Clear any shown answer feedback when going back
        setShowAnswerSheet(false);
        return;
      }
      
      // On first question, go back to podcast if we have podcastId
      if (podcastId) {
        router.replace(`/podcast/${podcastId}` as any);
      } else {
        // Fallback: always go to home for better UX
        router.replace('/');
      }
    } catch (error) {
      console.error('Error navigating back:', error);
      // Final fallback: try to navigate to home
      router.push('/');
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1">
        <SafeAreaView className="flex-1">
          <StatusBar barStyle="dark-content" />
          <View className="flex-1 justify-center items-center">
            <Text className="text-lg text-slate-900 font-geist-medium">Loading quiz...</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (!quiz) {
    return (
      <View className="flex-1">
        <SafeAreaView className="flex-1">
          <StatusBar barStyle="dark-content" />
          <View className="flex-1 justify-center items-center">
            <Text className="text-lg text-slate-900 font-geist-medium">Quiz not found</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const hasSelectedAnswer = answers.some(answer => answer.questionId === currentQuestion.id);

  return (
    <View className="flex-1">
      <SafeAreaView className="flex-1">
        <Stack.Screen 
          options={{
            headerShown: false,
          }}
        />
        <StatusBar barStyle="dark-content" />

        {/* Content wrapper with max width */}
        <View className="flex-1 mx-auto w-full" style={{ maxWidth: 768 }}>
          {/* Custom Header */}
          <View className="flex-row items-center px-6 pt-4 pb-4">
            <TouchableOpacity
              onPress={handleExitQuiz}
              className="w-10 h-10 items-center justify-center rounded-full"
              style={{ backgroundColor: 'rgba(74, 68, 89, 0.08)' }}
              activeOpacity={0.7}
            >
              <Icon name="chevron-back" size={24} color="#000" />
            </TouchableOpacity>
            
            {/* Progress Bar and Counter */}
            <View className="flex-1 flex-row items-center gap-8 ml-8">
              <View className="flex-1 bg-white h-3 rounded-full overflow-hidden">
                <View 
                  className="h-full bg-slate-900 rounded-full"
                  style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length * 100)}%` }}
                />
              </View>
              
              <Text className="text-black text-sm font-geist">
                {currentQuestionIndex + 1}/{quiz.questions.length}
              </Text>
            </View>
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
            <View className="px-6 pt-8">
              <QuizQuestion
                question={currentQuestion}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={quiz.questions.length}
                onOptionSelect={handleOptionSelect}
                disabled={showAnswerSheet}
                showCorrectAnswer={false}
                selectedOptionId={
                  answers.find(answer => answer.questionId === currentQuestion.id)?.selectedOptionId
                }
                quiz={quiz}
              />
            </View>
          </ScrollView>

          {/* Fixed Check Answer Button */}
          <View className="absolute bottom-0 left-0 right-0 px-6 py-4">
            <TouchableOpacity
              className="rounded-full py-4 items-center justify-center"
              disabled={!hasSelectedAnswer || showAnswerSheet}
              style={{ 
                backgroundColor: hasSelectedAnswer && !showAnswerSheet ? '#020617' : '#64748b'
              }}
              onPress={handleCheckAnswer}
            >
              <Text 
                className="text-base font-geist-medium"
                style={{
                  color: hasSelectedAnswer && !showAnswerSheet ? 'white' : '#94a3b8'
                }}
              >
                Check answer
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Answer Feedback Bottom Sheet */}
        <BottomSheet
          visible={showAnswerSheet}
          onClose={() => setShowAnswerSheet(false)}
          height={600}
        >
          <AnswerFeedback
            isCorrect={answers.find(a => a.questionId === currentQuestion.id)?.isCorrect || false}
            selectedOption={currentQuestion.options.find(opt => opt.id === answers.find(a => a.questionId === currentQuestion.id)?.selectedOptionId) || currentQuestion.options[0]}
            correctOption={currentQuestion.options.find(opt => opt.isCorrect) || currentQuestion.options[0]}
            allOptions={currentQuestion.options}
            explanation={currentQuestion.explanation || 'No explanation available.'}
            onContinue={handleContinueFromFeedback}
            onClose={() => setShowAnswerSheet(false)}
          />
        </BottomSheet>
      </SafeAreaView>
    </View>
  );
}