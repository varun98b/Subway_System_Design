import { pool } from '../database/database';
import app from '../index';
import request from 'supertest';

let server: any;

beforeAll((done) => {
  server = app.listen(0, () => {  // Use a random available port
    console.log(`Testing server running on port ${server.address().port}`);
    done();
  });
});


afterAll((done) => {
    server.close(() => {
      console.log("Testing server closed");
      done();
    });
  });
  

describe('Database Connection', () => {
  it('should connect to the database', async () => {
    const client = await pool.connect();
    expect(client).toBeTruthy();
    client.release();  // Release the connection
  });

  it('should query a table in the database', async () => {
    const result = await pool.query('SELECT * FROM subway_system.train_lines');
    expect(result.rows.length).toBeGreaterThan(0);
  });
});

