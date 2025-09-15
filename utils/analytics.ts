import { gtag } from 'gtag';
import { Platform } from 'react-native';

// Replace with your actual GA4 Measurement ID
const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // TODO: Replace with your actual ID

// Initialize Google Analytics (web only)
export const initAnalytics = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    // Load gtag script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // Initialize gtag
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID);
  }
};

// Track custom events
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    gtag('event', eventName, parameters);
  }
};

// Specific tracking functions for your podcast app
export const analytics = {
  // Dive deeper tracking
  trackDiveDeeperClick: (podcastId: string, podcastTitle: string) => {
    trackEvent('dive_deeper_click', {
      podcast_id: podcastId,
      podcast_title: podcastTitle,
    });
  },

  trackDiveDeeperAction: (action: string, podcastId: string, podcastTitle: string) => {
    trackEvent('dive_deeper_action', {
      action,
      podcast_id: podcastId,
      podcast_title: podcastTitle,
    });
  },

  // Podcast playback tracking
  trackPodcastPlay: (podcastId: string, podcastTitle: string, category: string) => {
    trackEvent('podcast_play', {
      podcast_id: podcastId,
      podcast_title: podcastTitle,
      category,
    });
  },

  trackPodcastComplete: (podcastId: string, podcastTitle: string, duration: number) => {
    trackEvent('podcast_complete', {
      podcast_id: podcastId,
      podcast_title: podcastTitle,
      duration_minutes: Math.round(duration / 60),
    });
  },

  trackPodcastProgress: (podcastId: string, progressPercentage: number) => {
    trackEvent('podcast_progress', {
      podcast_id: podcastId,
      progress_percentage: progressPercentage,
    });
  },

  // Quiz tracking
  trackQuizAttempt: (podcastId: string, podcastTitle: string, attemptNumber: number) => {
    trackEvent('quiz_attempt', {
      podcast_id: podcastId,
      podcast_title: podcastTitle,
      attempt_number: attemptNumber,
    });
  },

  trackQuizComplete: (podcastId: string, score: number, passed: boolean, attemptNumber: number) => {
    trackEvent('quiz_complete', {
      podcast_id: podcastId,
      score,
      passed,
      attempt_number: attemptNumber,
    });
  },

  // Session tracking
  trackUserSession: (sessionData: { podcasts_played: number; quizzes_attempted: number }) => {
    trackEvent('user_session', sessionData);
  },

  // Generic page views
  trackPageView: (pageName: string, additionalParams?: Record<string, any>) => {
    trackEvent('page_view', {
      page_name: pageName,
      ...additionalParams,
    });
  },
};