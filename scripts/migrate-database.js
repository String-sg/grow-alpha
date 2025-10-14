#!/usr/bin/env node

// Database migration script for admin podcast management
// Run with: npm run migrate:admin

require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

// Get and process DATABASE_URL from environment
const rawDatabaseUrl = process.env.DATABASE_URL;

if (!rawDatabaseUrl) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Extract PostgreSQL URL from psql command format
const extractPostgresUrl = (connectionString) => {
  if (!connectionString) return '';
  if (connectionString.startsWith('postgresql://')) return connectionString;
  const match = connectionString.match(/psql\s+'([^']+)'/);
  return match && match[1] ? match[1] : connectionString;
};

const DATABASE_URL = extractPostgresUrl(rawDatabaseUrl);
console.log('Using database URL:', DATABASE_URL.replace(/:[^:@]*@/, ':***@'));

const sql = neon(DATABASE_URL);

async function runMigration() {
  console.log('🔄 Running admin features migration...\n');

  try {
    // Step 1: Add is_admin column to users table
    console.log('1. Adding is_admin column to users table...');
    await sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
    `;
    console.log('✅ is_admin column added\n');

    // Step 2: Set admin status for specified users
    console.log('2. Setting admin status for authorized users...');
    await sql`
      UPDATE users
      SET is_admin = TRUE
      WHERE email IN ('lee_kah_how@moe.edu.sg', 'tay_hui_zhen_jasmine@moe.gov.sg');
    `;
    console.log('✅ Admin users updated\n');

    // Step 3: Create podcasts table
    console.log('3. Creating podcasts table...');
    await sql`
      CREATE TABLE IF NOT EXISTS podcasts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        author VARCHAR(255) NOT NULL,
        category VARCHAR(255),
        image_url TEXT,
        audio_url TEXT,
        duration_ms INTEGER,
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(50) DEFAULT 'active'
      );
    `;
    console.log('✅ Podcasts table created\n');

    // Step 4: Create podcast_sources table
    console.log('4. Creating podcast_sources table...');
    await sql`
      CREATE TABLE IF NOT EXISTS podcast_sources (
        id SERIAL PRIMARY KEY,
        podcast_id UUID REFERENCES podcasts(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        url TEXT NOT NULL,
        type VARCHAR(50) NOT NULL CHECK (type IN ('research', 'article', 'study', 'website', 'book', 'video', 'intranet', 'other')),
        author VARCHAR(255),
        published_date VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✅ Podcast sources table created\n');

    // Step 5: Create admin_logs table
    console.log('5. Creating admin_logs table...');
    await sql`
      CREATE TABLE IF NOT EXISTS admin_logs (
        id SERIAL PRIMARY KEY,
        admin_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        action VARCHAR(100) NOT NULL,
        resource_type VARCHAR(50) NOT NULL,
        resource_id VARCHAR(255),
        details JSONB,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('✅ Admin logs table created\n');

    // Step 6: Create indexes for performance
    console.log('6. Creating database indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_podcasts_created_by ON podcasts(created_by);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_podcasts_status ON podcasts(status);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_podcast_sources_podcast_id ON podcast_sources(podcast_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_logs(created_at);`;
    console.log('✅ Indexes created\n');

    // Step 7: Show current admin users
    console.log('7. Current admin users:');
    const adminUsers = await sql`
      SELECT email, name, is_admin, created_at
      FROM users
      WHERE is_admin = TRUE
      ORDER BY email;
    `;

    if (adminUsers.length > 0) {
      adminUsers.forEach(user => {
        console.log(`   👑 ${user.name} (${user.email})`);
      });
    } else {
      console.log('   No admin users found');
    }

    console.log('\n🎉 Migration completed successfully!');
    console.log('Your database is ready for admin podcast management.');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('\nDetails:', error);
    process.exit(1);
  }
}

runMigration();