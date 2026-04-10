import pool from './index';

async function initDb() {
  console.log('Initializing database...');
  
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS bids (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      agency TEXT NOT NULL,
      region TEXT NOT NULL,
      portal TEXT NOT NULL,
      portal_url TEXT,
      est_value TEXT,
      deadline TIMESTAMP,
      posted_at TIMESTAMP,
      set_aside TEXT,
      naics TEXT,
      doc_urls TEXT[],
      hash TEXT UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await pool.query(createTableQuery);
    console.log('Successfully created/verified "bids" table.');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDb();
