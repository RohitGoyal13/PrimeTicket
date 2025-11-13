const dotenv = require("dotenv");
dotenv.config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// prevent unhandled client errors from killing the process
pool.on('error', (err) => {
  console.error('Unexpected idle client error', err);
});

// simple verification (uses a query, doesn't keep a client checked out)
pool.query('SELECT 1')
  .then(() => console.log('✅ Connected to Neon PostgreSQL'))
  .catch((err) => console.error('❌ Failed to connect to Neon PostgreSQL', err));

module.exports = pool;
