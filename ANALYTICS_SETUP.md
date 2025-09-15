# Google Analytics 4 Setup Guide

Google Analytics 4 has been implemented in your podcast app to track the specific metrics you requested.

## Setup Instructions

### 1. Get Your GA4 Measurement ID

1. Go to [Google Analytics](https://analytics.google.com/)
2. Create a new GA4 property for your web app
3. Copy your Measurement ID (format: `G-XXXXXXXXXX`)

### 2. Configure Your Measurement ID

Edit `/utils/analytics.ts` and replace the placeholder:

```typescript
// Replace with your actual GA4 Measurement ID
const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // TODO: Replace with your actual ID
```

### 3. Verify Installation

1. Run your app with `npm start`
2. Open in web browser
3. Open browser developer tools → Network tab
4. Look for requests to `googletagmanager.com` to confirm tracking is working

## Events Being Tracked

Your app now tracks all the metrics you specified:

### 1. **Dive Deeper Button Clicks**
- **Event**: `dive_deeper_click`
- **When**: User clicks "Take the quiz" button
- **Data**: podcast_id, podcast_title

### 2. **Dive Deeper Actions**
- **Event**: `dive_deeper_action`
- **When**: User clicks Script or Sources buttons
- **Data**: action (view_script/view_sources), podcast_id, podcast_title

### 3. **Podcast Play Events**
- **Event**: `podcast_play`
- **When**: User starts playing any podcast
- **Data**: podcast_id, podcast_title, category

### 4. **Podcast Completion Events**
- **Event**: `podcast_progress` (at 80%)
- **Event**: `podcast_complete` (at 100%)
- **When**: User reaches 80% or 100% of podcast
- **Data**: podcast_id, progress_percentage OR duration_minutes

### 5. **Quiz Attempts**
- **Event**: `quiz_attempt`
- **When**: User starts a quiz
- **Data**: podcast_id, podcast_title, attempt_number

### 6. **Quiz Completion**
- **Event**: `quiz_complete`
- **When**: User finishes a quiz
- **Data**: podcast_id, score, passed (true/false), attempt_number

## Session Tracking

You can also track session-level data:

```typescript
// Example: Track session summary when user leaves
analytics.trackUserSession({
  podcasts_played: 3,
  quizzes_attempted: 2
});
```

## Platform Support

- ✅ **Web**: Full Google Analytics 4 support
- ❌ **Mobile**: Analytics only work on web platform
- ❌ **Expo Go**: Analytics only work on web platform

## Custom Event Dashboard

In Google Analytics 4, go to **Events** to see your custom events:

- `dive_deeper_click` - Track quiz engagement
- `dive_deeper_action` - Track content exploration
- `podcast_play` - Track content consumption
- `podcast_progress` - Track completion rates
- `podcast_complete` - Track full listens
- `quiz_attempt` - Track quiz starts
- `quiz_complete` - Track quiz finishes

## Implementation Details

The analytics are implemented using:
- `gtag` library for Google Analytics 4
- Platform detection (web-only)
- Custom event tracking utility
- Automatic initialization on app start
- Progress tracking in AudioContext
- Quiz attempt counting in AsyncStorage

All tracking respects user privacy and only works on the web platform as requested.