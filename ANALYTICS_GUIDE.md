# Google Analytics Implementation Guide

## Overview
This implementation tracks key metrics for the Grow Alpha podcast platform using Google Analytics 4 (GA4) with tracking ID: `G-9PGS9WVX3K`

## Tracked Events

### 1. User Tracking
- **Page Views**: Automatically tracked when users visit the site
- **Session Duration**: Tracked when users leave the page
- **Scroll Depth**: Tracks how far users scroll (25%, 50%, 75%, 100% milestones)

### 2. Podcast Play Tracking
- **podcast_play**: When play button is clicked
- **audio_started**: When audio actually begins playing
- **podcast_progress_25/50/75**: Progress milestones
- **podcast_completed**: When podcast finishes

### 3. Dive Deeper Button Tracking
- **dive_deeper_clicked**: When "Dive Deeper" button is pressed

## Google Analytics Dashboard Setup

### Custom Events to Monitor:
1. **podcast_play** - Total podcast plays
2. **dive_deeper_clicked** - Total dive deeper interactions
3. **podcast_completed** - Completion rate
4. **session_duration** - User engagement time

### Recommended GA4 Reports:

#### 1. Podcast Engagement Report
- Primary dimension: Event name
- Metrics: Event count, Users
- Filter: event_name contains "podcast"

#### 2. Content Interaction Report
- Primary dimension: event_label (episode names)
- Secondary dimension: event_name
- Metrics: Event count, Users

#### 3. User Behavior Report
- Events: page_view, session_duration, scroll_depth
- Metrics: Users, Average session duration

## How to Access Data in GA4

### Real-time Reports
1. Go to GA4 → Reports → Realtime
2. View current active users and events

### Event Reports
1. Go to GA4 → Reports → Engagement → Events
2. Filter by specific event names (podcast_play, dive_deeper_clicked)

### Custom Explorations
1. Go to GA4 → Explore
2. Create custom reports with:
   - Dimensions: Event name, Event label
   - Metrics: Event count, Users

### Key Metrics Dashboard
Create a custom dashboard showing:
- Total Users (daily/weekly/monthly)
- Total Podcast Plays
- Total Dive Deeper Clicks
- Average Session Duration
- Podcast Completion Rate

## Event Parameters
Each event includes these parameters for detailed analysis:
- `event_category`: Groups related events
- `event_label`: Specific episode or content name
- `podcast_id`: Unique identifier for each podcast
- `custom_parameter_1`: Additional context

## Data Export
- Use GA4's built-in export to Google Sheets
- Set up automated reports via email
- Use GA4 Data API for programmatic access

## Implementation Notes
- Events are tracked immediately when triggered
- All tracking respects user privacy settings
- Console logs help with debugging during development
- Progress tracking prevents duplicate events with flags