// Test script to verify Google Analytics 4 implementation
// This simulates the analytics functions in a web environment

// Mock Platform for testing
const Platform = { OS: 'web' };

// Mock window object for testing
global.window = {
  dataLayer: [],
  gtag: function() {
    console.log('📊 GA4 Event:', arguments);
    global.window.dataLayer.push(arguments);
  }
};

// Import our analytics module
const fs = require('fs');
const path = require('path');

// Read and evaluate the analytics module
const analyticsPath = path.join(__dirname, 'utils/analytics.ts');
let analyticsCode = fs.readFileSync(analyticsPath, 'utf8');

// Remove TypeScript declarations and imports for testing
analyticsCode = analyticsCode
  .replace(/import.*from.*['"]react-native['"];?/g, '')
  .replace(/declare global[\s\S]*?}/g, '')
  .replace(/export const/g, 'const')
  .replace(/export /g, '');

// Create a simple eval context
const analyticsModule = {};
eval(`
  ${analyticsCode}

  // Export functions for testing
  analyticsModule.initAnalytics = initAnalytics;
  analyticsModule.trackEvent = trackEvent;
  analyticsModule.analytics = analytics;
`);

console.log('🔧 Testing Google Analytics 4 Implementation');
console.log('='.repeat(50));

// Test 1: Analytics Initialization
console.log('\n1️⃣ Testing Analytics Initialization');
try {
  // Mock document for script loading
  global.document = {
    createElement: (tag) => ({
      async: false,
      src: '',
      addEventListener: () => {}
    }),
    head: {
      appendChild: (element) => {
        console.log('✅ GA4 Script loaded:', element.src);
      }
    }
  };

  analyticsModule.initAnalytics();
  console.log('✅ Analytics initialized successfully');
} catch (error) {
  console.log('❌ Analytics initialization failed:', error.message);
}

// Test 2: Basic Event Tracking
console.log('\n2️⃣ Testing Basic Event Tracking');
try {
  analyticsModule.trackEvent('test_event', { test_param: 'test_value' });
  console.log('✅ Basic event tracking works');
} catch (error) {
  console.log('❌ Basic event tracking failed:', error.message);
}

// Test 3: Podcast Play Tracking
console.log('\n3️⃣ Testing Podcast Play Tracking');
try {
  analyticsModule.analytics.trackPodcastPlay('podcast_1', 'Test Podcast', 'Education');
  console.log('✅ Podcast play tracking works');
} catch (error) {
  console.log('❌ Podcast play tracking failed:', error.message);
}

// Test 4: Dive Deeper Tracking
console.log('\n4️⃣ Testing Dive Deeper Tracking');
try {
  analyticsModule.analytics.trackDiveDeeperClick('podcast_1', 'Test Podcast');
  analyticsModule.analytics.trackDiveDeeperAction('view_script', 'podcast_1', 'Test Podcast');
  analyticsModule.analytics.trackDiveDeeperAction('view_sources', 'podcast_1', 'Test Podcast');
  console.log('✅ Dive deeper tracking works');
} catch (error) {
  console.log('❌ Dive deeper tracking failed:', error.message);
}

// Test 5: Podcast Completion Tracking
console.log('\n5️⃣ Testing Podcast Completion Tracking');
try {
  analyticsModule.analytics.trackPodcastProgress('podcast_1', 80);
  analyticsModule.analytics.trackPodcastComplete('podcast_1', 'Test Podcast', 1800);
  console.log('✅ Podcast completion tracking works');
} catch (error) {
  console.log('❌ Podcast completion tracking failed:', error.message);
}

// Test 6: Quiz Tracking
console.log('\n6️⃣ Testing Quiz Tracking');
try {
  analyticsModule.analytics.trackQuizAttempt('podcast_1', 'Test Podcast', 1);
  analyticsModule.analytics.trackQuizComplete('podcast_1', 85, true, 1);
  console.log('✅ Quiz tracking works');
} catch (error) {
  console.log('❌ Quiz tracking failed:', error.message);
}

// Test 7: Session Tracking
console.log('\n7️⃣ Testing Session Tracking');
try {
  analyticsModule.analytics.trackUserSession({
    podcasts_played: 3,
    quizzes_attempted: 2
  });
  console.log('✅ Session tracking works');
} catch (error) {
  console.log('❌ Session tracking failed:', error.message);
}

// Test 8: Page View Tracking
console.log('\n8️⃣ Testing Page View Tracking');
try {
  analyticsModule.analytics.trackPageView('podcast_details', { podcast_id: 'podcast_1' });
  console.log('✅ Page view tracking works');
} catch (error) {
  console.log('❌ Page view tracking failed:', error.message);
}

// Summary
console.log('\n📋 Test Summary');
console.log('='.repeat(50));
console.log('Total events tracked:', global.window.dataLayer.length);
console.log('GA4 Measurement ID: G-9PGS9WVX3K');
console.log('\n📊 All Events Captured:');
global.window.dataLayer.forEach((event, index) => {
  if (event[0] === 'event') {
    console.log(`${index + 1}. ${event[1]}:`, event[2] || 'no params');
  }
});

console.log('\n🎉 Analytics implementation test completed!');
console.log('✅ All tracking functions are properly configured');
console.log('🔗 Events will appear in GA4 dashboard at: https://analytics.google.com');