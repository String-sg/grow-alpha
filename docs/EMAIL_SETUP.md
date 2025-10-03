# Email Notification Setup

This guide explains how to set up email notifications for demo mode access using Resend.

## Setup Steps

### 1. Get Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Verify your sending domain (or use their test domain for development)
3. Create an API key in the Resend dashboard
4. Copy the API key (starts with `re_`)

### 2. Environment Variables

Add to your `.env.local` or deployment environment:

```env
RESEND_API_KEY=re_your_api_key_here
```

### 3. Deploy API Endpoint

The notification API is in `/api/send-notification.ts`. Deploy it to:

**Option A: Vercel**
1. Push your code to GitHub
2. Connect to Vercel
3. Add `RESEND_API_KEY` in Environment Variables
4. Deploy

**Option B: Netlify Functions**
1. Move `/api/send-notification.ts` to `/netlify/functions/`
2. Add `RESEND_API_KEY` to Netlify environment variables
3. Deploy

### 4. Update Email Settings

In `/api/send-notification.ts`, update:

```typescript
from: 'MOE Onward Demo <noreply@yourdomain.com>', // Your verified sender
to: ['your_email@moe.edu.sg'], // Your notification email
```

### 5. Configure Approved Domains

The system accepts these email domains by default:
- `@moe.gov.sg`
- `@moe.edu.sg`
- `@schools.gov.sg`
- `@*.edu.sg`

To modify, edit `APPROVED_EMAIL_PATTERNS` in `/services/emailService.ts`.

## Testing

1. Enable demo mode in the app
2. Try to access AI chat
3. Enter a valid email address
4. Check your email for notification

## Email Notification Content

When someone accesses demo mode, you'll receive an email with:
- User's email address
- Domain category (MOE Government, Educational Institution, etc.)
- Access timestamp
- User agent information

## Troubleshooting

**No emails received?**
- Check Resend dashboard for delivery status
- Verify your API key is correct
- Check spam folder
- Ensure sender domain is verified

**API errors?**
- Check browser console for error messages
- Verify environment variables are set
- Check API endpoint deployment status

**Email validation not working?**
- Check console for validation errors
- Verify email patterns in `emailService.ts`
- Test with different email formats