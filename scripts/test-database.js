#!/usr/bin/env node

// Test script to verify database connection and user service
// Run with: node scripts/test-database.js

const { neon } = require('@neondatabase/serverless');

// Get DATABASE_URL from environment
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  console.log('Please add DATABASE_URL to your .env file');
  process.exit(1);
}

const sql = neon(DATABASE_URL);

async function testDatabase() {
  console.log('🔍 Testing Neon database connection...\n');

  try {
    // Test 1: Basic connection
    console.log('1. Testing basic connection...');
    const result = await sql`SELECT NOW() as current_time`;
    console.log('✅ Database connected successfully');
    console.log(`   Current time: ${result[0].current_time}\n`);

    // Test 2: Create users table
    console.log('2. Creating/verifying users table...');
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
    console.log('✅ Users table created/verified\n');

    // Test 3: Insert test user
    console.log('3. Testing user creation...');
    const testUser = {
      google_id: 'test-google-id-' + Date.now(),
      uuid: 'test-uuid-' + Date.now(),
      email: 'test@moe.edu.sg',
      name: 'Test User',
    };

    const domain = testUser.email.split('@')[1];
    const insertResult = await sql`
      INSERT INTO users (google_id, uuid, email, name, domain, created_at, updated_at, last_login)
      VALUES (${testUser.google_id}, ${testUser.uuid}, ${testUser.email}, ${testUser.name}, ${domain}, NOW(), NOW(), NOW())
      RETURNING *;
    `;

    console.log('✅ Test user created successfully');
    console.log(`   User ID: ${insertResult[0].id}`);
    console.log(`   Email: ${insertResult[0].email}`);
    console.log(`   Domain: ${insertResult[0].domain}\n`);

    // Test 4: Query user
    console.log('4. Testing user lookup...');
    const lookupResult = await sql`
      SELECT * FROM users WHERE google_id = ${testUser.google_id} LIMIT 1;
    `;

    if (lookupResult.length > 0) {
      console.log('✅ User lookup successful');
      console.log(`   Found user: ${lookupResult[0].name} (${lookupResult[0].email})\n`);
    } else {
      console.log('❌ User lookup failed\n');
    }

    // Test 5: Update user login time
    console.log('5. Testing user update...');
    await sql`
      UPDATE users
      SET last_login = NOW(), updated_at = NOW()
      WHERE google_id = ${testUser.google_id};
    `;
    console.log('✅ User update successful\n');

    // Test 6: Clean up test user
    console.log('6. Cleaning up test data...');
    await sql`
      DELETE FROM users WHERE google_id = ${testUser.google_id};
    `;
    console.log('✅ Test data cleaned up\n');

    // Test 7: Show existing users (if any)
    console.log('7. Checking existing users...');
    const existingUsers = await sql`SELECT COUNT(*) as count FROM users`;
    console.log(`✅ Current user count: ${existingUsers[0].count}\n`);

    console.log('🎉 All database tests passed!');
    console.log('Your Neon database is ready for the app.');

  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('\nDetails:', error);
    process.exit(1);
  }
}

testDatabase();