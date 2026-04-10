import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check (Triggering deployment fix)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.json({ status: 'active', service: 'BidWatch API' });
});

// Trigger a manual scrape
app.post('/api/scrape', async (req, res) => {
  console.log('Manual scrape triggered via API');
  try {
    const { runAll } = await import('./scrapers/run_all');
    const result = await runAll();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: 'Scraping failed', message: err.message });
  }
});

// Get all bids
app.get('/api/bids', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM bids ORDER BY posted_at DESC NULLS LAST, created_at DESC');
    res.json(result.rows);
  } catch (err: any) {
    console.error('Database error:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Basic Go/No-Go Scoring (Simple keyword matching for now)
app.get('/api/bids/:id/analysis', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM bids WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bid not found' });
    }
    
    const bid = result.rows[0];
    // Simple mock logic as requested/planned
    const keywords = ['janitorial', 'custodial', 'cleaning'];
    const matches = keywords.some(k => bid.title.toLowerCase().includes(k));
    
    res.json({
      bidId: id,
      score: matches ? 85 : 40,
      analysis: matches 
        ? "High-fit opportunity: Scope matches core janitorial capabilities." 
        : "Medium-fit: Title does not explicitly mention core janitorial keywords, but may be relevant."
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(Number(port), '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
