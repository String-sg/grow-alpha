import Constants from 'expo-constants';

// Cloudinary configuration - using direct API calls instead of SDK
const CLOUDINARY_CONFIG = {
  cloud_name: Constants.expoConfig?.extra?.cloudinaryCloudName,
  api_key: Constants.expoConfig?.extra?.cloudinaryApiKey,
  api_secret: Constants.expoConfig?.extra?.cloudinaryApiSecret,
  upload_url: `https://api.cloudinary.com/v1_1/${Constants.expoConfig?.extra?.cloudinaryCloudName}/upload`,
};

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
      CLOUDINARY_CONFIG.cloud_name &&
      CLOUDINARY_CONFIG.api_key &&
      CLOUDINARY_CONFIG.api_secret
    );
  }

  /**
   * Generate signature for Cloudinary upload
   */
  private generateSignature(params: Record<string, any>): string {
    // For simplicity in React Native, we'll use unsigned upload
    // In production, you'd want to generate the signature on your backend
    return '';
  }

  /**
   * Upload audio file to Cloudinary using fetch API
   */
  async uploadAudio(
    fileUri: string,
    options: AudioUploadOptions = {}
  ): Promise<CloudinaryUploadResult> {
    if (!this.isConfigured()) {
      throw new Error('Cloudinary not configured. Please check environment variables.');
    }

    try {
      console.log('Uploading audio to Cloudinary...', {
        fileUri,
        cloudName: CLOUDINARY_CONFIG.cloud_name,
        uploadUrl: `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloud_name}/upload`
      });

      // Create FormData for upload
      const formData = new FormData();

      // Add file
      formData.append('file', {
        uri: fileUri,
        type: 'audio/mpeg', // Default to MP3
        name: options.public_id ? `${options.public_id}.mp3` : 'audio.mp3',
      } as any);

      // Add upload parameters
      formData.append('upload_preset', 'podcast_uploads'); // You'll need to create this preset
      formData.append('resource_type', 'video'); // Use 'video' for audio files
      formData.append('folder', options.folder || 'podcasts/audio');

      if (options.public_id) {
        formData.append('public_id', options.public_id);
      }

      const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloud_name}/upload`;

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let browser set it automatically for FormData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

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

      // Note: Deletion requires server-side implementation for security
      // For now, we'll just log the intent
      console.warn('Audio deletion not implemented in React Native - requires backend API');

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

    const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloud_name}/video/upload`;
    const transformations = [];

    if (options.quality) {
      transformations.push(`q_${options.quality}`);
    }

    if (options.format) {
      transformations.push(`f_${options.format}`);
    }

    const transformString = transformations.length > 0 ? `${transformations.join(',')}/` : '';
    return `${baseUrl}/${transformString}${publicId}`;
  }

  /**
   * Get waveform image URL for audio visualization
   */
  getWaveformUrl(publicId: string): string {
    if (!this.isConfigured()) {
      throw new Error('Cloudinary not configured');
    }

    return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloud_name}/video/upload/fl_waveform/${publicId}.png`;
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
      console.log('Uploading image to Cloudinary...', { fileUri });

      // Create FormData for upload
      const formData = new FormData();

      // Add file
      formData.append('file', {
        uri: fileUri,
        type: 'image/jpeg',
        name: options.public_id ? `${options.public_id}.jpg` : 'image.jpg',
      } as any);

      // Add upload parameters
      formData.append('upload_preset', 'podcast_uploads'); // Same preset as audio
      formData.append('resource_type', 'image');
      formData.append('folder', options.folder || 'podcasts/images');

      if (options.public_id) {
        formData.append('public_id', options.public_id);
      }

      const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloud_name}/upload`;

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let browser set it automatically for FormData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

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
      console.warn('Cloudinary not configured');
      return false;
    }

    try {
      // Simple test by checking if cloud name is accessible
      const testUrl = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloud_name}/image/upload/sample.jpg`;
      const response = await fetch(testUrl, { method: 'HEAD' });

      const isWorking = response.ok || response.status === 404; // 404 is fine, means cloud exists
      console.log('Cloudinary connection test result:', {
        cloud_name: CLOUDINARY_CONFIG.cloud_name,
        working: isWorking,
      });

      return isWorking;
    } catch (error) {
      console.error('Cloudinary connection test failed:', error);
      return false;
    }
  }
}

export const cloudinaryService = new CloudinaryService();