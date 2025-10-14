import { sql, initializeDatabase } from '@/config/database';

export interface DatabasePodcast {
  id: string; // UUID
  title: string;
  description: string;
  author: string;
  category: string | null;
  image_url: string | null;
  audio_url: string | null;
  duration_ms: number | null;
  created_by: number | null; // User ID (integer)
  created_at: string;
  updated_at: string;
  status: string;
}

export interface DatabasePodcastSource {
  id: number;
  podcast_id: string;
  title: string;
  url: string;
  type: 'research' | 'article' | 'study' | 'website' | 'book' | 'video' | 'intranet' | 'other';
  author: string | null;
  published_date: string | null;
  created_at: string;
}

export interface CreatePodcastData {
  title: string;
  description: string;
  author: string;
  category?: string;
  image_url?: string;
  audio_url?: string;
  duration_ms?: number;
  created_by: number; // User ID
  sources?: {
    title: string;
    url: string;
    type: 'research' | 'article' | 'study' | 'website' | 'book' | 'video' | 'intranet' | 'other';
    author?: string;
    published_date?: string;
  }[];
}

export interface UpdatePodcastData {
  title?: string;
  description?: string;
  author?: string;
  category?: string;
  image_url?: string;
  audio_url?: string;
  duration_ms?: number;
}

class PodcastService {
  private initialized = false;

  private async ensureInitialized() {
    if (!this.initialized && sql) {
      try {
        await initializeDatabase();
        this.initialized = true;
      } catch (error) {
        console.error('Failed to initialize database:', error);
        throw error;
      }
    }
  }

  /**
   * Create a new podcast with sources
   */
  async createPodcast(podcastData: CreatePodcastData): Promise<DatabasePodcast | null> {
    if (!sql) {
      console.warn('Database not configured, skipping podcast creation');
      return null;
    }

    try {
      await this.ensureInitialized();

      // Create the podcast first
      const podcastResult = await sql`
        INSERT INTO podcasts (
          title, description, author, category, image_url, audio_url, duration_ms, created_by
        )
        VALUES (
          ${podcastData.title},
          ${podcastData.description},
          ${podcastData.author},
          ${podcastData.category || null},
          ${podcastData.image_url || null},
          ${podcastData.audio_url || null},
          ${podcastData.duration_ms || null},
          ${podcastData.created_by}
        )
        RETURNING *;
      `;

      const podcast = podcastResult[0] as DatabasePodcast;

      // Create sources if provided
      if (podcastData.sources && podcastData.sources.length > 0) {
        for (const source of podcastData.sources) {
          await sql`
            INSERT INTO podcast_sources (
              podcast_id, title, url, type, author, published_date
            )
            VALUES (
              ${podcast.id},
              ${source.title},
              ${source.url},
              ${source.type},
              ${source.author || null},
              ${source.published_date || null}
            );
          `;
        }
      }

      // Log admin activity
      await sql`
        INSERT INTO admin_logs (admin_id, action, resource_type, resource_id, details)
        VALUES (
          ${podcastData.created_by},
          'create_podcast',
          'podcast',
          ${podcast.id},
          ${JSON.stringify({ title: podcast.title, sources_count: podcastData.sources?.length || 0 })}
        );
      `;

      const result = podcast;

      console.log('Podcast created successfully:', result.id);
      return result;
    } catch (error) {
      console.error('Failed to create podcast:', error);
      throw error;
    }
  }

  /**
   * Get all podcasts with their sources
   */
  async getAllPodcasts(): Promise<(DatabasePodcast & { sources: DatabasePodcastSource[] })[]> {
    if (!sql) {
      console.warn('Database not configured, returning empty array');
      return [];
    }

    try {
      await this.ensureInitialized();

      // Get all active podcasts
      const podcasts = await sql`
        SELECT * FROM podcasts
        WHERE status = 'active'
        ORDER BY created_at DESC;
      ` as DatabasePodcast[];

      // Get sources for all podcasts
      const podcastsWithSources = await Promise.all(
        podcasts.map(async (podcast) => {
          const sources = await sql`
            SELECT * FROM podcast_sources
            WHERE podcast_id = ${podcast.id}
            ORDER BY created_at ASC;
          ` as DatabasePodcastSource[];

          return { ...podcast, sources };
        })
      );

      return podcastsWithSources;
    } catch (error) {
      console.error('Failed to get podcasts:', error);
      throw error;
    }
  }

  /**
   * Get a single podcast by ID with sources
   */
  async getPodcastById(id: string): Promise<(DatabasePodcast & { sources: DatabasePodcastSource[] }) | null> {
    if (!sql) {
      console.warn('Database not configured, returning null');
      return null;
    }

    try {
      await this.ensureInitialized();

      const podcastResult = await sql`
        SELECT * FROM podcasts WHERE id = ${id} AND status = 'active' LIMIT 1;
      `;

      if (podcastResult.length === 0) {
        return null;
      }

      const podcast = podcastResult[0] as DatabasePodcast;

      const sources = await sql`
        SELECT * FROM podcast_sources
        WHERE podcast_id = ${id}
        ORDER BY created_at ASC;
      ` as DatabasePodcastSource[];

      return { ...podcast, sources };
    } catch (error) {
      console.error('Failed to get podcast by ID:', error);
      throw error;
    }
  }

  /**
   * Update a podcast
   */
  async updatePodcast(
    id: string,
    updates: UpdatePodcastData,
    adminId: number
  ): Promise<DatabasePodcast | null> {
    if (!sql) {
      console.warn('Database not configured, skipping update');
      return null;
    }

    try {
      await this.ensureInitialized();

      // Check if there are any updates to make
      const hasUpdates = updates.title || updates.description || updates.author ||
                        updates.category !== undefined || updates.image_url !== undefined ||
                        updates.audio_url !== undefined || updates.duration_ms !== undefined;

      if (!hasUpdates) {
        return await this.getPodcastById(id).then(p => p || null);
      }

      // Build dynamic update query manually since we need conditional updates
      let query = 'UPDATE podcasts SET ';
      const queryValues = [];

      if (updates.title) {
        query += 'title = $' + (queryValues.length + 1) + ', ';
        queryValues.push(updates.title);
      }
      if (updates.description) {
        query += 'description = $' + (queryValues.length + 1) + ', ';
        queryValues.push(updates.description);
      }
      if (updates.author) {
        query += 'author = $' + (queryValues.length + 1) + ', ';
        queryValues.push(updates.author);
      }
      if (updates.category !== undefined) {
        query += 'category = $' + (queryValues.length + 1) + ', ';
        queryValues.push(updates.category);
      }
      if (updates.image_url !== undefined) {
        query += 'image_url = $' + (queryValues.length + 1) + ', ';
        queryValues.push(updates.image_url);
      }
      if (updates.audio_url !== undefined) {
        query += 'audio_url = $' + (queryValues.length + 1) + ', ';
        queryValues.push(updates.audio_url);
      }
      if (updates.duration_ms !== undefined) {
        query += 'duration_ms = $' + (queryValues.length + 1) + ', ';
        queryValues.push(updates.duration_ms);
      }

      query += 'updated_at = NOW() WHERE id = $' + (queryValues.length + 1) + ' RETURNING *';
      queryValues.push(id);

      const result = await sql.unsafe(query, queryValues);
      const updatedPodcast = result[0] as DatabasePodcast;

      // Log admin activity
      await sql`
        INSERT INTO admin_logs (admin_id, action, resource_type, resource_id, details)
        VALUES (
          ${adminId},
          'update_podcast',
          'podcast',
          ${id},
          ${JSON.stringify(updates)}
        );
      `;

      console.log('Podcast updated successfully:', id);
      return updatedPodcast;
    } catch (error) {
      console.error('Failed to update podcast:', error);
      throw error;
    }
  }

  /**
   * Delete a podcast (hard delete)
   */
  async deletePodcast(id: string, adminId: number): Promise<boolean> {
    if (!sql) {
      console.warn('Database not configured, skipping delete');
      return false;
    }

    try {
      await this.ensureInitialized();

      // Get podcast info for logging
      const podcast = await sql`
        SELECT title FROM podcasts WHERE id = ${id} LIMIT 1;
      `;

      if (podcast.length === 0) {
        throw new Error('Podcast not found');
      }

      // Delete sources (cascade will handle this, but being explicit)
      await sql`DELETE FROM podcast_sources WHERE podcast_id = ${id};`;

      // Delete podcast
      const deleteResult = await sql`DELETE FROM podcasts WHERE id = ${id};`;

      // Log admin activity
      await sql`
        INSERT INTO admin_logs (admin_id, action, resource_type, resource_id, details)
        VALUES (
          ${adminId},
          'delete_podcast',
          'podcast',
          ${id},
          ${JSON.stringify({ title: podcast[0].title })}
        );
      `;

      const result = deleteResult.length > 0;

      console.log('Podcast deleted successfully:', id);
      return result;
    } catch (error) {
      console.error('Failed to delete podcast:', error);
      throw error;
    }
  }

  /**
   * Get admin activity logs
   */
  async getAdminLogs(limit: number = 50): Promise<any[]> {
    if (!sql) {
      console.warn('Database not configured, returning empty array');
      return [];
    }

    try {
      await this.ensureInitialized();

      const logs = await sql`
        SELECT
          al.*,
          u.name as admin_name,
          u.email as admin_email
        FROM admin_logs al
        LEFT JOIN users u ON al.admin_id = u.id
        ORDER BY al.created_at DESC
        LIMIT ${limit};
      `;

      return logs;
    } catch (error) {
      console.error('Failed to get admin logs:', error);
      throw error;
    }
  }
}

export const podcastService = new PodcastService();