-- Run this in your PostgreSQL database:
-- psql "$DATABASE_URL" -f sql/schema.sql

CREATE TABLE IF NOT EXISTS captions (
  id SERIAL PRIMARY KEY,
  context TEXT,
  result TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

