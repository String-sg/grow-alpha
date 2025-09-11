// Google Analytics tracking functions for Grow Alpha

// Track user engagement - automatically tracked by GA4 for page views
document.addEventListener('DOMContentLoaded', function() {
    // Track initial page load as user visit
    gtag('event', 'page_view', {
        page_title: 'Grow Alpha Podcast Platform',
        page_location: window.location.href
    });
    
    console.log('Google Analytics initialized for Grow Alpha');
});

// Track podcast play events
function playPodcast(podcastId, episodeName) {
    const audioElement = document.getElementById(podcastId);
    
    if (audioElement) {
        // Play the audio
        audioElement.play();
        
        // Track the play event in Google Analytics
        gtag('event', 'podcast_play', {
            event_category: 'Podcast Engagement',
            event_label: episodeName,
            podcast_id: podcastId,
            custom_parameter_1: 'play_button_clicked'
        });
        
        console.log('Tracked podcast play:', episodeName);
        
        // Also track when the audio actually starts playing
        audioElement.addEventListener('play', function() {
            gtag('event', 'audio_started', {
                event_category: 'Podcast Engagement',
                event_label: episodeName,
                podcast_id: podcastId
            });
        }, { once: true });
        
        // Track when audio ends
        audioElement.addEventListener('ended', function() {
            gtag('event', 'podcast_completed', {
                event_category: 'Podcast Engagement',
                event_label: episodeName,
                podcast_id: podcastId
            });
        }, { once: true });
        
        // Track progress at 25%, 50%, 75%
        let progress25 = false, progress50 = false, progress75 = false;
        audioElement.addEventListener('timeupdate', function() {
            const progress = (audioElement.currentTime / audioElement.duration) * 100;
            
            if (progress >= 25 && !progress25) {
                progress25 = true;
                gtag('event', 'podcast_progress_25', {
                    event_category: 'Podcast Engagement',
                    event_label: episodeName,
                    podcast_id: podcastId
                });
            }
            if (progress >= 50 && !progress50) {
                progress50 = true;
                gtag('event', 'podcast_progress_50', {
                    event_category: 'Podcast Engagement',
                    event_label: episodeName,
                    podcast_id: podcastId
                });
            }
            if (progress >= 75 && !progress75) {
                progress75 = true;
                gtag('event', 'podcast_progress_75', {
                    event_category: 'Podcast Engagement',
                    event_label: episodeName,
                    podcast_id: podcastId
                });
            }
        });
    }
}

// Track "Dive Deeper" button clicks
function diveDeeperClicked(episodeName) {
    // Track the dive deeper event in Google Analytics
    gtag('event', 'dive_deeper_clicked', {
        event_category: 'Content Engagement',
        event_label: episodeName,
        custom_parameter_1: 'dive_deeper_button'
    });
    
    console.log('Tracked dive deeper click:', episodeName);
    
    // Simulate diving deeper action (you can replace this with actual functionality)
    alert('Diving deeper into: ' + episodeName + '\n\nThis interaction has been tracked in Google Analytics!');
}

// Track user session duration
let sessionStartTime = new Date().getTime();

window.addEventListener('beforeunload', function() {
    const sessionDuration = Math.round((new Date().getTime() - sessionStartTime) / 1000);
    
    gtag('event', 'session_duration', {
        event_category: 'User Engagement',
        event_label: 'Session Length',
        value: sessionDuration,
        custom_parameter_1: 'seconds_on_site'
    });
});

// Track scroll depth
let maxScrollDepth = 0;
window.addEventListener('scroll', function() {
    const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
    
    if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        
        // Track milestone scroll depths
        if (maxScrollDepth >= 25 && maxScrollDepth < 50) {
            gtag('event', 'scroll_depth_25', {
                event_category: 'User Engagement',
                event_label: 'Page Scroll',
                value: 25
            });
        } else if (maxScrollDepth >= 50 && maxScrollDepth < 75) {
            gtag('event', 'scroll_depth_50', {
                event_category: 'User Engagement',
                event_label: 'Page Scroll',
                value: 50
            });
        } else if (maxScrollDepth >= 75 && maxScrollDepth < 100) {
            gtag('event', 'scroll_depth_75', {
                event_category: 'User Engagement',
                event_label: 'Page Scroll',
                value: 75
            });
        } else if (maxScrollDepth >= 100) {
            gtag('event', 'scroll_depth_100', {
                event_category: 'User Engagement',
                event_label: 'Page Scroll',
                value: 100
            });
        }
    }
});

// Utility function to track custom events
function trackCustomEvent(eventName, category, label, value = null) {
    const eventParams = {
        event_category: category,
        event_label: label
    };
    
    if (value !== null) {
        eventParams.value = value;
    }
    
    gtag('event', eventName, eventParams);
    console.log('Custom event tracked:', eventName, category, label, value);
}