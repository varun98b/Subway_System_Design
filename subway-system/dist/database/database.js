"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.pool = new pg_1.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT)
});
// Set the schema search path when the connection is established
exports.pool.on('connect', (client) => __awaiter(void 0, void 0, void 0, function* () {
    const schema = process.env.DB_SCHEMA || 'public'; // Use schema from .env or fallback to 'public'
    yield client.query(`SET search_path TO ${schema}, public`);
    //console.log(`Connected to PostgreSQL with schema: ${schema}`);
}));
exports.pool.on('error', (err) => {
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
