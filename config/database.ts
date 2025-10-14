import { neon } from '@neondatabase/serverless';
import Constants from 'expo-constants';

export const DATABASE_URL = Constants.expoConfig?.extra?.databaseUrl || '';

if (!DATABASE_URL) {
  console.warn('DATABASE_URL not found in environment variables');
}

export const sql = DATABASE_URL ? neon(DATABASE_URL) : null;

export const initializeDatabase = async () => {
  if (!sql) {
    throw new Error('Database not configured');
  }

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        google_id VARCHAR(255) UNIQUE NOT NULL,
        uuid VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        domain VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
};