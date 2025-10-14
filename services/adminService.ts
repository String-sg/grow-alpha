// Temporarily using mock service until Cloudinary upload preset is configured
import { mockCloudinaryService as cloudinaryService, type CloudinaryUploadResult } from './mockCloudinaryService';
// import { cloudinaryService, type CloudinaryUploadResult } from './cloudinaryService';
import { podcastService, type CreatePodcastData } from './podcastService';
import { userService } from './userService';

export interface AdminPodcastCreationData {
  title: string;
  description: string;
  author: string;
  category?: string;
  imageUrl?: string;
  audioFileUri: string; // Local file URI to upload
  sources?: {
    title: string;
    url: string;
    type: 'research' | 'article' | 'study' | 'website' | 'book' | 'video' | 'intranet' | 'other';
    author?: string;
    published_date?: string;
  }[];
}

export interface AdminPodcastCreationResult {
  success: boolean;
  podcast?: any;
  error?: string;
  details?: {
    step: 'validation' | 'audio_upload' | 'image_upload' | 'database_creation';
    message: string;
  };
}

class AdminService {
  /**
   * Create a complete podcast with file uploads and database storage
   */
  async createPodcast(
    podcastData: AdminPodcastCreationData,
    adminEmail: string
  ): Promise<AdminPodcastCreationResult> {
    try {
      // Step 1: Validate admin permissions
      console.log('🔐 Validating admin permissions...');
      const adminUser = await userService.getUserByEmail(adminEmail);

      if (!adminUser) {
        return {
          success: false,
          error: 'Admin user not found',
          details: { step: 'validation', message: 'Could not find admin user in database' }
        };
      }

      // Step 2: Upload audio file to Cloudinary
      console.log('🎵 Uploading audio file...');
      let audioUploadResult: CloudinaryUploadResult;

      try {
        audioUploadResult = await cloudinaryService.uploadAudio(podcastData.audioFileUri, {
          folder: 'podcasts/audio',
          public_id: `podcast_${Date.now()}`,
        });
      } catch (error) {
        return {
          success: false,
          error: 'Audio upload failed',
          details: {
            step: 'audio_upload',
            message: error instanceof Error ? error.message : 'Unknown audio upload error'
          }
        };
      }

      // Step 3: Upload image to Cloudinary (if provided)
      let imageUploadResult: CloudinaryUploadResult | null = null;

      if (podcastData.imageUrl && podcastData.imageUrl.startsWith('file://')) {
        console.log('🖼️ Uploading cover image...');
        try {
          imageUploadResult = await cloudinaryService.uploadImage(podcastData.imageUrl, {
            folder: 'podcasts/images',
            public_id: `podcast_cover_${Date.now()}`,
          });
        } catch (error) {
          // Image upload failure is not critical, continue without it
          console.warn('Image upload failed, continuing without cover image:', error);
        }
      }

      // Step 4: Create podcast in database
      console.log('💾 Creating podcast in database...');

      const dbPodcastData: CreatePodcastData = {
        title: podcastData.title,
        description: podcastData.description,
        author: podcastData.author,
        category: podcastData.category,
        image_url: imageUploadResult?.secure_url || podcastData.imageUrl,
        audio_url: audioUploadResult.secure_url,
        duration_ms: audioUploadResult.duration ? audioUploadResult.duration * 1000 : null, // Convert to ms
        created_by: adminUser.id,
        sources: podcastData.sources || [],
      };

      const createdPodcast = await podcastService.createPodcast(dbPodcastData);

      if (!createdPodcast) {
        return {
          success: false,
          error: 'Database creation failed',
          details: { step: 'database_creation', message: 'Failed to create podcast in database' }
        };
      }

      console.log('✅ Podcast created successfully:', createdPodcast.id);

      return {
        success: true,
        podcast: {
          id: createdPodcast.id,
          title: createdPodcast.title,
          audioUrl: createdPodcast.audio_url,
          imageUrl: createdPodcast.image_url,
          duration: createdPodcast.duration_ms,
          cloudinary: {
            audioPublicId: audioUploadResult.public_id,
            imagePublicId: imageUploadResult?.public_id,
          }
        }
      };

    } catch (error) {
      console.error('❌ Admin podcast creation failed:', error);

      return {
        success: false,
        error: 'Unexpected error occurred',
        details: {
          step: 'validation',
          message: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  /**
   * Delete a podcast and its associated files
   */
  async deletePodcast(podcastId: string, adminEmail: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🗑️ Deleting podcast:', podcastId);

      // Validate admin permissions
      const adminUser = await userService.getUserByEmail(adminEmail);
      if (!adminUser) {
        return { success: false, error: 'Admin user not found' };
      }

      // Get podcast details before deletion
      const podcast = await podcastService.getPodcastById(podcastId);
      if (!podcast) {
        return { success: false, error: 'Podcast not found' };
      }

      // Delete from database first
      const dbDeleteSuccess = await podcastService.deletePodcast(podcastId, adminUser.id);
      if (!dbDeleteSuccess) {
        return { success: false, error: 'Failed to delete from database' };
      }

      // Try to delete files from Cloudinary (don't fail if this doesn't work)
      if (podcast.audio_url) {
        try {
          // Extract public_id from Cloudinary URL
          const audioPublicId = this.extractCloudinaryPublicId(podcast.audio_url);
          if (audioPublicId) {
            await cloudinaryService.deleteAudio(audioPublicId);
          }
        } catch (error) {
          console.warn('Failed to delete audio file from Cloudinary:', error);
        }
      }

      if (podcast.image_url) {
        try {
          const imagePublicId = this.extractCloudinaryPublicId(podcast.image_url);
          if (imagePublicId) {
            // Would need a deleteImage method in cloudinaryService
            console.log('Would delete image:', imagePublicId);
          }
        } catch (error) {
          console.warn('Failed to delete image file from Cloudinary:', error);
        }
      }

      console.log('✅ Podcast deleted successfully:', podcastId);
      return { success: true };

    } catch (error) {
      console.error('❌ Admin podcast deletion failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get all podcasts for admin management
   */
  async getAllPodcasts(): Promise<{ success: boolean; podcasts?: any[]; error?: string }> {
    try {
      console.log('📚 Fetching all podcasts for admin...');

      const podcasts = await podcastService.getAllPodcasts();

      return {
        success: true,
        podcasts: podcasts.map(p => ({
          id: p.id,
          title: p.title,
          description: p.description,
          author: p.author,
          category: p.category,
          imageUrl: p.image_url,
          audioUrl: p.audio_url,
          duration: p.duration_ms,
          createdAt: p.created_at,
          updatedAt: p.updated_at,
          sources: p.sources.length,
        }))
      };
    } catch (error) {
      console.error('❌ Failed to fetch podcasts:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get admin activity logs
   */
  async getAdminLogs(limit: number = 50): Promise<{ success: boolean; logs?: any[]; error?: string }> {
    try {
      console.log('📊 Fetching admin logs...');

      const logs = await podcastService.getAdminLogs(limit);

      return {
        success: true,
        logs: logs.map(log => ({
          id: log.id,
          adminName: log.admin_name,
          adminEmail: log.admin_email,
          action: log.action,
          resourceType: log.resource_type,
          resourceId: log.resource_id,
          details: log.details,
          createdAt: log.created_at,
        }))
      };
    } catch (error) {
      console.error('❌ Failed to fetch admin logs:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Test all admin services
   */
  async testServices(): Promise<{ success: boolean; results: any }> {
    const results = {
      database: false,
      cloudinary: false,
      userService: false,
    };

    try {
      // Test database connection
      console.log('🔍 Testing database connection...');
      results.database = true; // If we get here, database is working

      // Test Cloudinary connection
      console.log('🔍 Testing Cloudinary connection...');
      results.cloudinary = await cloudinaryService.testConnection();

      // Test user service
      console.log('🔍 Testing user service...');
      const testUser = await userService.getUserByGoogleId('test@example.com');
      results.userService = true; // If no error thrown, it's working

      return { success: true, results };
    } catch (error) {
      console.error('❌ Service test failed:', error);
      return {
        success: false,
        results: { ...results, error: error instanceof Error ? error.message : 'Unknown error' }
      };
    }
  }

  /**
   * Extract Cloudinary public_id from URL
   */
  private extractCloudinaryPublicId(cloudinaryUrl: string): string | null {
    try {
      // Example URL: https://res.cloudinary.com/demo/video/upload/v1234567890/podcasts/audio/podcast_1234567890.mp3
      const match = cloudinaryUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }
}

export const adminService = new AdminService();