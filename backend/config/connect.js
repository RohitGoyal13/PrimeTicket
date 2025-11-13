const dotenv = require("dotenv");
dotenv.config();

const { Pool } = require("pg");

// Create a single connection pool using the full DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,  // required for Neon
  }
});

// Test connection
pool.connect()
  .then(() => {
    console.log("✅ Connected to Neon PostgreSQL");
  })
  .catch((err) => {
    console.error("❌ Failed to connect to Neon PostgreSQL", err);
  });

module.exports = pool;
