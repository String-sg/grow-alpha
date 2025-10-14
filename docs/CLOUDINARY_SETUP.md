# Cloudinary Setup for Real File Uploads

Currently using mock Cloudinary service for development. To enable real file uploads:

## 1. Create Upload Preset

In your [Cloudinary Dashboard](https://cloudinary.com/console):

1. Go to **Settings** → **Upload**
2. Scroll down to **Upload presets**
3. Click **Add upload preset**

### Preset Configuration:
- **Preset name**: `podcast_uploads`
- **Signing Mode**: `Unsigned`
- **Folder**: `podcasts`
- **Resource Type**: `Auto`

### Audio Settings:
- **Allowed formats**: `mp3,wav,m4a,aac,ogg`
- **Auto tagging**: `90` (optional)
- **Quality**: `auto`

### Image Settings:
- **Allowed formats**: `jpg,png,webp,gif`
- **Transformation**:
  - Width: `800`
  - Height: `800`
  - Crop: `fill`
  - Quality: `auto`

## 2. Update Environment Variables

Your `.env` file should have:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 3. Switch to Real Service

In `services/adminService.ts`, change:
```typescript
// FROM:
import { mockCloudinaryService as cloudinaryService } from './mockCloudinaryService';

// TO:
import { cloudinaryService } from './cloudinaryService';
```

## 4. Test Upload

1. Sign in as admin (`lee_kah_how@moe.edu.sg`)
2. Tap the blue + button
3. Fill out the podcast form
4. Select an audio file
5. Submit and watch for real upload progress

## Current Status: Using Mock Service

The app is currently using `mockCloudinaryService` which:
- ✅ Simulates file upload delays
- ✅ Returns mock URLs and metadata
- ✅ Tests the complete workflow
- ✅ Saves everything to database (except real files)

## Expected Errors (When Using Mock)

These are normal with the mock service:
- File URLs will return 404 (not real files)
- Duration detection is simulated (3 minutes)
- File sizes are mocked values

## Production Checklist

- [ ] Create `podcast_uploads` preset in Cloudinary
- [ ] Verify unsigned uploads work
- [ ] Switch to real cloudinaryService
- [ ] Test with real audio files
- [ ] Verify playback works in app
- [ ] Set up proper error handling