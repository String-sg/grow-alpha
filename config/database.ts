import { neon } from '@neondatabase/serverless';
import Constants from 'expo-constants';

const rawDatabaseUrl = Constants.expoConfig?.extra?.databaseUrl || '';

// Extract PostgreSQL URL from psql command format
const extractPostgresUrl = (connectionString: string): string => {
  if (!connectionString) return '';

  // If it's already a postgresql:// URL, return as-is
  if (connectionString.startsWith('postgresql://')) {
    return connectionString;
  }

  // Extract from psql format: psql 'postgresql://...'
  const match = connectionString.match(/psql\s+'([^']+)'/);
  if (match && match[1]) {
    return match[1];
  }

  // If no match, return original (might be valid URL)
  return connectionString;
};

export const DATABASE_URL = extractPostgresUrl(rawDatabaseUrl);

if (!DATABASE_URL) {
  console.warn('DATABASE_URL not found in environment variables');
} else {
  console.log('Database URL configured:', DATABASE_URL.replace(/:[^:@]*@/, ':***@')); // Hide password in logs
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