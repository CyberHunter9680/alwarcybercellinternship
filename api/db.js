const { Pool } = require('pg');
require('dotenv').config?.();

let pool;

function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!connectionString) {
      return null;
    }
    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      },
      max: 10, // max connection pool size
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle Neon PostgreSQL client', err);
    });
  }
  return pool;
}

async function initDatabase() {
  const p = getPool();
  if (!p) return;

  const query = `
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

    CREATE INDEX IF NOT EXISTS idx_applicants_created_at ON applicants (created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_applicants_duration ON applicants (duration);
    CREATE INDEX IF NOT EXISTS idx_applicants_status ON applicants (status);
  `;
  await p.query(query);
}

module.exports = {
  getPool,
  initDatabase
};
