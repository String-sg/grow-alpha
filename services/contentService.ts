import { EducationalContent } from '@/data/educational-content';
import { PodcastSource } from '@/types/podcast';
import { podcastService, type DatabasePodcast } from './podcastService';

/**
 * Hybrid content service that combines database podcasts with mock educational content
 */
class ContentService {
  /**
   * Convert database podcast to EducationalContent format
   */
  private convertPodcastToEducationalContent(podcast: DatabasePodcast & { sources: any[] }): EducationalContent {
    return {
      id: podcast.id,
      title: podcast.title,
      description: podcast.description,
      summary: this.extractSummaryFromDescription(podcast.description),
      category: podcast.category || 'General',
      author: podcast.author,
      duration: podcast.duration_ms || 0,
      imageUrl: podcast.image_url || 'https://picsum.photos/400/400?random=' + podcast.id.slice(-2),
      audioUrl: podcast.audio_url || '',
      backgroundColor: 'bg-white',
      badgeColor: 'bg-green-200',
      textColor: 'text-green-900',
      timeLeft: this.formatDuration(podcast.duration_ms || 0),
      progress: 0,
      publishedDate: this.formatPublishDate(podcast.created_at),
      createdAt: new Date(podcast.created_at),
      sources: podcast.sources?.map(source => ({
        title: source.title,
        url: source.url,
        type: source.type as PodcastSource['type'],
        author: source.author,
        publishedDate: source.published_date,
      })) || [],
    };
  }

  /**
   * Extract summary from description (first paragraph or first 200 chars)
   */
  private extractSummaryFromDescription(description: string): string {
    // Look for first paragraph or learning objectives
    const firstParagraph = description.split('\n\n')[0];
    if (firstParagraph.length > 200) {
      return firstParagraph.substring(0, 200) + '...';
    }
    return firstParagraph;
  }

  /**
   * Format duration from milliseconds to readable string
   */
  private formatDuration(milliseconds: number): string {
    const minutes = Math.floor(milliseconds / 60000);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }

    return `${minutes}m`;
  }

  /**
   * Format publish date for display
   */
  private formatPublishDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;

    return date.toLocaleDateString();
  }

  /**
   * Get all content: database podcasts + static educational content
   */
  async getAllContent(staticContent: EducationalContent[]): Promise<EducationalContent[]> {
    try {
      // Get database podcasts
      const dbPodcasts = await podcastService.getAllPodcasts();

      // Convert database podcasts to EducationalContent format
      const dbContent = dbPodcasts.map(podcast =>
        this.convertPodcastToEducationalContent(podcast)
      );

      // Combine and sort by creation date (newest first)
      const allContent = [...dbContent, ...staticContent];

      // Sort by creation date, with database content generally appearing first
      allContent.sort((a, b) => {
        // Database content (with audio URLs) gets priority
        const aIsDatabase = typeof a.audioUrl === 'string' && a.audioUrl.includes('cloudinary');
        const bIsDatabase = typeof b.audioUrl === 'string' && b.audioUrl.includes('cloudinary');

        if (aIsDatabase && !bIsDatabase) return -1;
        if (!aIsDatabase && bIsDatabase) return 1;

        // If both are same type, sort by creation date
        return b.createdAt.getTime() - a.createdAt.getTime();
      });

      console.log(`📚 Loaded ${allContent.length} content items (${dbContent.length} from database, ${staticContent.length} static)`);

      return allContent;
    } catch (error) {
      console.error('Failed to load database content, falling back to static content:', error);
      return staticContent;
    }
  }

  /**
   * Get content by ID (check database first, then static)
   */
  async getContentById(id: string, staticContent: EducationalContent[]): Promise<EducationalContent | null> {
    try {
      // Try database first
      const dbPodcast = await podcastService.getPodcastById(id);
      if (dbPodcast) {
        return this.convertPodcastToEducationalContent(dbPodcast);
      }

      // Fall back to static content
      return staticContent.find(content => content.id === id) || null;
    } catch (error) {
      console.error('Failed to get content from database:', error);
      return staticContent.find(content => content.id === id) || null;
    }
  }

  /**
   * Search content across database and static content
   */
  async searchContent(query: string, staticContent: EducationalContent[]): Promise<EducationalContent[]> {
    const allContent = await this.getAllContent(staticContent);

    const lowerQuery = query.toLowerCase();
    return allContent.filter(content =>
      content.title.toLowerCase().includes(lowerQuery) ||
      content.description.toLowerCase().includes(lowerQuery) ||
      content.author.toLowerCase().includes(lowerQuery) ||
      content.category.toLowerCase().includes(lowerQuery)
    );
  }
}

export const contentService = new ContentService();