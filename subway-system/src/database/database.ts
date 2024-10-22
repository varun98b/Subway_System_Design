import { Pool } from 'pg';
import dotenv from 'dotenv';


dotenv.config();

export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT)
});

// Set the schema search path when the connection is established
pool.on('connect', async (client) => {
  const schema = process.env.DB_SCHEMA || 'public';  // Use schema from .env or fallback to 'public'
  await client.query(`SET search_path TO ${schema}, public`);
  //console.log(`Connected to PostgreSQL with schema: ${schema}`);
});

pool.on('error', (err) => {
  console.error('Error connecting to PostgreSQL database:', err);
});













/*
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Create a PostgreSQL connection pool
export const pool = new Pool({
  user: process.env.DB_USER,         // Database username
  host: process.env.DB_HOST,         // Hostname (usually localhost)
  database: process.env.DB_NAME,     // Database name
  password: process.env.DB_PASSWORD, // Database password
  port: Number(process.env.DB_PORT), // Port (usually 5432)
  searchPath: process.env.DB_SCHEMA ? [process.env.DB_SCHEMA] : ['public'],  // Default to 'public'
});

// Check if the connection is successful
pool.on('connect', () => {
  console.log('Connected to the PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Error connecting to the PostgreSQL database:', err);
});
*/