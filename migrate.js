const { Pool } = require('pg');
require('dotenv').config?.();

const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_b4oGt2ehLBCX@ep-mute-king-b315bk71-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  console.log('🔄 Connecting to Neon PostgreSQL Database...');
  
  try {
    const client = await pool.connect();
    console.log('✅ Connection established successfully to Neon Cloud!');

    console.log('📦 Creating/Verifying tables & security constraints...');
    
    // Create applicants table
    await client.query(`
      CREATE TABLE IF NOT EXISTS applicants (
        id VARCHAR(60) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        mobile VARCHAR(30) NOT NULL,
        email VARCHAR(255) NOT NULL,
        course VARCHAR(255) NOT NULL,
        year_sem VARCHAR(100) NOT NULL,
        duration VARCHAR(100) NOT NULL,
        college VARCHAR(255) NOT NULL,
        skills TEXT[] NOT NULL DEFAULT '{}',
        why_join TEXT NOT NULL,
        resume_name VARCHAR(255),
        resume_size VARCHAR(50),
        resume_data TEXT,
        status VARCHAR(50) DEFAULT 'Pending',
        applied_at VARCHAR(100) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create indexes for high performance & real-time search
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_applicants_created_at ON applicants (created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_applicants_duration ON applicants (duration);
      CREATE INDEX IF NOT EXISTS idx_applicants_status ON applicants (status);
      CREATE INDEX IF NOT EXISTS idx_applicants_email ON applicants (email);
      CREATE INDEX IF NOT EXISTS idx_applicants_mobile ON applicants (mobile);
    `);

    // Fetch count of current records
    const countRes = await client.query('SELECT COUNT(*) FROM applicants;');
    console.log(`📊 Current live applicants in Neon Database: ${countRes.rows[0].count}`);

    client.release();
    await pool.end();
    console.log('🚀 Database migration completed successfully with 0 errors!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

runMigration();
