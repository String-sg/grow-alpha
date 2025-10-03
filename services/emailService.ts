/**
 * Simple email service using Resend for demo mode notifications
 */

// Email domain validation patterns
export const APPROVED_EMAIL_PATTERNS = [
  /^[a-zA-Z0-9._%+-]+@moe\.gov\.sg$/,
  /^[a-zA-Z0-9._%+-]+@moe\.edu\.sg$/,
  /^[a-zA-Z0-9._%+-]+@schools\.gov\.sg$/,
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.edu\.sg$/
];

/**
 * Validate if email belongs to approved domains
 */
export const isValidEmailDomain = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;

  const trimmedEmail = email.trim().toLowerCase();
  return APPROVED_EMAIL_PATTERNS.some(pattern => pattern.test(trimmedEmail));
};

/**
 * Get domain category for the email
 */
export const getEmailDomainCategory = (email: string): string => {
  const domain = email.split('@')[1]?.toLowerCase();

  if (domain === 'moe.gov.sg') return 'MOE Government';
  if (domain === 'moe.edu.sg') return 'MOE Education';
  if (domain === 'schools.gov.sg') return 'Government School';
  if (domain?.endsWith('.edu.sg')) return 'Educational Institution';

  return 'Unknown';
};

/**
 * Send notification email when user accesses demo mode with email
 * This runs on web only due to CORS and API key security
 */
export const sendDemoAccessNotification = async (userEmail: string): Promise<boolean> => {
  // Only attempt to send emails on web platform
  if (typeof window === 'undefined') {
    console.log('Email notification skipped: not running on web platform');
    return false;
  }

  try {
    const domainCategory = getEmailDomainCategory(userEmail);

    // Simple fetch to a serverless function or API endpoint
    // For now, we'll use a mock implementation that logs the attempt
    console.log('Demo Access Notification:', {
      userEmail,
      domainCategory,
      timestamp: new Date().toISOString(),
      userAgent: navigator?.userAgent || 'Unknown'
    });

    // Send notification via API endpoint
    try {
      const response = await fetch('/api/send-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail,
          domainCategory,
          timestamp: new Date().toISOString(),
          userAgent: navigator?.userAgent || 'Unknown'
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Email notification sent successfully:', result);
        return true;
      } else {
        console.error('Failed to send email notification:', response.status, response.statusText);
        return false;
      }
    } catch (fetchError) {
      console.error('Network error sending notification:', fetchError);
      // Still return true so user isn't blocked, just log the issue
      return true;
    }
  } catch (error) {
    console.error('Failed to send demo access notification:', error);
    return false;
  }
};

/**
 * Validate and process email for demo mode access
 */
export const processDemoEmailAccess = async (email: string): Promise<{
  isValid: boolean;
  email?: string;
  domainCategory?: string;
  notificationSent?: boolean;
}> => {
  const trimmedEmail = email.trim().toLowerCase();

  if (!isValidEmailDomain(trimmedEmail)) {
    return { isValid: false };
  }

  const domainCategory = getEmailDomainCategory(trimmedEmail);

  // Send notification (non-blocking)
  const notificationSent = await sendDemoAccessNotification(trimmedEmail);

  return {
    isValid: true,
    email: trimmedEmail,
    domainCategory,
    notificationSent
  };
};