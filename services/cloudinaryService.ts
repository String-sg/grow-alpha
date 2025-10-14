import { v2 as cloudinary } from 'cloudinary';
import Constants from 'expo-constants';

// Configure Cloudinary
cloudinary.config({
  cloud_name: Constants.expoConfig?.extra?.cloudinaryCloudName,
  api_key: Constants.expoConfig?.extra?.cloudinaryApiKey,
  api_secret: Constants.expoConfig?.extra?.cloudinaryApiSecret,
});

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  duration?: number; // Duration in seconds for audio files
  format: string;
  resource_type: string;
  bytes: number;
}

export interface AudioUploadOptions {
  folder?: string;
  public_id?: string;
  resource_type?: 'auto' | 'video'; // 'video' includes audio files
  format?: string;
}

class CloudinaryService {
  private isConfigured(): boolean {
    return !!(
      Constants.expoConfig?.extra?.cloudinaryCloudName &&
      Constants.expoConfig?.extra?.cloudinaryApiKey &&
      Constants.expoConfig?.extra?.cloudinaryApiSecret
    );
  }

  /**
   * Upload audio file to Cloudinary
   */
  async uploadAudio(
    fileUri: string,
    options: AudioUploadOptions = {}
  ): Promise<CloudinaryUploadResult> {
    if (!this.isConfigured()) {
      throw new Error('Cloudinary not configured. Please check environment variables.');
    }

    try {
      const uploadOptions = {
        resource_type: 'video' as const, // Use 'video' for audio files
        folder: options.folder || 'podcasts/audio',
        public_id: options.public_id,
        format: options.format,
        // Audio-specific options
        audio_codec: 'mp3',
        quality: 'auto',
        // Generate waveform and extract metadata
        eager: [
          { format: 'waveform', flags: 'waveform' },
        ],
      };

      console.log('Uploading audio to Cloudinary...', { fileUri, options: uploadOptions });

      const result = await cloudinary.uploader.upload(fileUri, uploadOptions);

      console.log('Audio upload successful:', {
        public_id: result.public_id,
        duration: result.duration,
        format: result.format,
        bytes: result.bytes,
      });

      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
        duration: result.duration,
        format: result.format,
        resource_type: result.resource_type,
        bytes: result.bytes,
      };
    } catch (error) {
      console.error('Audio upload failed:', error);
      throw new Error(`Failed to upload audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete audio file from Cloudinary
   */
  async deleteAudio(publicId: string): Promise<void> {
    if (!this.isConfigured()) {
      throw new Error('Cloudinary not configured');
    }

    try {
      console.log('Deleting audio from Cloudinary:', publicId);
      await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
      console.log('Audio deleted successfully');
    } catch (error) {
      console.error('Audio deletion failed:', error);
      throw new Error(`Failed to delete audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get audio URL with transformations
   */
  getAudioUrl(publicId: string, options: { quality?: string; format?: string } = {}): string {
    if (!this.isConfigured()) {
      throw new Error('Cloudinary not configured');
    }

    return cloudinary.url(publicId, {
      resource_type: 'video',
      quality: options.quality || 'auto',
      format: options.format || 'mp3',
      secure: true,
    });
  }

  /**
   * Get waveform image URL for audio visualization
   */
  getWaveformUrl(publicId: string): string {
    if (!this.isConfigured()) {
      throw new Error('Cloudinary not configured');
    }

    return cloudinary.url(publicId, {
      resource_type: 'video',
      format: 'png',
      flags: 'waveform',
      secure: true,
    });
  }

  /**
   * Upload image (for podcast covers)
   */
  async uploadImage(
    fileUri: string,
    options: { folder?: string; public_id?: string } = {}
  ): Promise<CloudinaryUploadResult> {
    if (!this.isConfigured()) {
      throw new Error('Cloudinary not configured');
    }

    try {
      const uploadOptions = {
        resource_type: 'image' as const,
        folder: options.folder || 'podcasts/images',
        public_id: options.public_id,
        quality: 'auto',
        format: 'webp',
        transformation: [
          { width: 800, height: 800, crop: 'fill', quality: 'auto' },
        ],
      };

      console.log('Uploading image to Cloudinary...', { fileUri, options: uploadOptions });

      const result = await cloudinary.uploader.upload(fileUri, uploadOptions);

      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
        format: result.format,
        resource_type: result.resource_type,
        bytes: result.bytes,
      };
    } catch (error) {
      console.error('Image upload failed:', error);
      throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Test Cloudinary configuration
   */
  async testConnection(): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }

    try {
      // Test by fetching API usage info
      const result = await cloudinary.api.usage();
      console.log('Cloudinary connection test successful:', {
        cloud_name: result.cloud_name,
        usage: result.credits,
      });
      return true;
    } catch (error) {
      console.error('Cloudinary connection test failed:', error);
      return false;
    }
  }
}

export const cloudinaryService = new CloudinaryService();