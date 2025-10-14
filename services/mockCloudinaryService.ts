// Temporary mock service for development/testing
// Replace with real cloudinaryService once upload preset is configured

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  duration?: number;
  format: string;
  resource_type: string;
  bytes: number;
}

export interface AudioUploadOptions {
  folder?: string;
  public_id?: string;
  resource_type?: 'auto' | 'video';
  format?: string;
}

class MockCloudinaryService {
  /**
   * Mock audio upload - simulates Cloudinary upload
   */
  async uploadAudio(
    fileUri: string,
    options: AudioUploadOptions = {}
  ): Promise<CloudinaryUploadResult> {
    console.log('🚧 Using MOCK Cloudinary service');
    console.log('Mock uploading audio:', { fileUri, options });

    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate mock response
    const publicId = options.public_id || `podcast_${Date.now()}`;
    const mockResult: CloudinaryUploadResult = {
      public_id: publicId,
      secure_url: `https://res.cloudinary.com/demo/video/upload/${publicId}.mp3`,
      duration: 180, // 3 minutes mock duration
      format: 'mp3',
      resource_type: 'video',
      bytes: 5242880, // 5MB mock size
    };

    console.log('Mock audio upload result:', mockResult);
    return mockResult;
  }

  /**
   * Mock image upload
   */
  async uploadImage(
    fileUri: string,
    options: { folder?: string; public_id?: string } = {}
  ): Promise<CloudinaryUploadResult> {
    console.log('🚧 Using MOCK Cloudinary service');
    console.log('Mock uploading image:', { fileUri, options });

    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const publicId = options.public_id || `image_${Date.now()}`;
    const mockResult: CloudinaryUploadResult = {
      public_id: publicId,
      secure_url: `https://res.cloudinary.com/demo/image/upload/${publicId}.jpg`,
      format: 'jpg',
      resource_type: 'image',
      bytes: 1048576, // 1MB mock size
    };

    console.log('Mock image upload result:', mockResult);
    return mockResult;
  }

  /**
   * Mock delete
   */
  async deleteAudio(publicId: string): Promise<void> {
    console.log('🚧 Mock deleting audio:', publicId);
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Mock delete completed');
  }

  /**
   * Mock URL generation
   */
  getAudioUrl(publicId: string, options: { quality?: string; format?: string } = {}): string {
    return `https://res.cloudinary.com/demo/video/upload/${publicId}.mp3`;
  }

  /**
   * Mock waveform URL
   */
  getWaveformUrl(publicId: string): string {
    return `https://res.cloudinary.com/demo/video/upload/fl_waveform/${publicId}.png`;
  }

  /**
   * Mock connection test
   */
  async testConnection(): Promise<boolean> {
    console.log('🚧 Mock Cloudinary connection test');
    return true;
  }
}

export const mockCloudinaryService = new MockCloudinaryService();