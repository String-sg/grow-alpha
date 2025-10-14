import { sql, initializeDatabase } from '@/config/database';

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  order: number;
}

export interface DatabaseQuiz {
  id: string;
  podcast_id: string;
  questions: QuizQuestion[];
  created_at: string;
  updated_at: string;
}

class QuizService {
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
   * Create a quiz for a podcast
   */
  async createQuiz(podcastId: string, questions: QuizQuestion[]): Promise<DatabaseQuiz | null> {
    if (!sql) {
      console.warn('Database not configured, skipping quiz creation');
      return null;
    }

    try {
      await this.ensureInitialized();

      const result = await sql`
        INSERT INTO quizzes (podcast_id, questions)
        VALUES (${podcastId}, ${JSON.stringify(questions)})
        RETURNING *;
      `;

      const quiz = result[0] as DatabaseQuiz;
      console.log('Quiz created successfully for podcast:', podcastId);
      return quiz;
    } catch (error) {
      console.error('Failed to create quiz:', error);
      throw error;
    }
  }

  /**
   * Get quiz by podcast ID
   */
  async getQuizByPodcastId(podcastId: string): Promise<DatabaseQuiz | null> {
    if (!sql) {
      console.warn('Database not configured, returning null');
      return null;
    }

    try {
      await this.ensureInitialized();

      const result = await sql`
        SELECT * FROM quizzes WHERE podcast_id = ${podcastId} LIMIT 1;
      `;

      return result[0] as DatabaseQuiz || null;
    } catch (error) {
      console.error('Failed to get quiz by podcast ID:', error);
      throw error;
    }
  }

  /**
   * Update quiz questions
   */
  async updateQuiz(podcastId: string, questions: QuizQuestion[]): Promise<DatabaseQuiz | null> {
    if (!sql) {
      console.warn('Database not configured, skipping quiz update');
      return null;
    }

    try {
      await this.ensureInitialized();

      const result = await sql`
        UPDATE quizzes
        SET questions = ${JSON.stringify(questions)}, updated_at = NOW()
        WHERE podcast_id = ${podcastId}
        RETURNING *;
      `;

      return result[0] as DatabaseQuiz || null;
    } catch (error) {
      console.error('Failed to update quiz:', error);
      throw error;
    }
  }

  /**
   * Delete quiz by podcast ID
   */
  async deleteQuizByPodcastId(podcastId: string): Promise<boolean> {
    if (!sql) {
      console.warn('Database not configured, skipping quiz deletion');
      return false;
    }

    try {
      await this.ensureInitialized();

      const result = await sql`
        DELETE FROM quizzes WHERE podcast_id = ${podcastId};
      `;

      return result.length > 0;
    } catch (error) {
      console.error('Failed to delete quiz:', error);
      throw error;
    }
  }
}

export const quizService = new QuizService();