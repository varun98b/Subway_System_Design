import { pool } from '../database/database';

// Model to create a new train line
export const createTrainLine = async (name: string, fare: number, stations: string[]) => {

  const client = await pool.connect(); // Connect to the database
  try {
    await client.query('BEGIN'); // Start a transaction

    // Insert the train line and get the newly inserted line's ID
    const lineResult = await client.query(
      'INSERT INTO subway_system.train_lines (name, fare) VALUES ($1, $2) RETURNING id',
      [name, fare]
    );
    const lineId = lineResult.rows[0].id;

    // Insert the stations into the line_stations table with their order
    const stationInsertQueries = stations.map((stationName, index) =>
      client.query(
        'INSERT INTO subway_system.line_stations (line_id, station_id, station_order) VALUES ($1, (SELECT id FROM stations WHERE name = $2), $3)',
        [lineId, stationName, index + 1]
      )
    );

    // Execute all station insertions in parallel
    await Promise.all(stationInsertQueries);

    await client.query('COMMIT'); // Commit the transaction

    return { message: 'Train line created successfully', lineId };
  } catch (error) {
    await client.query('ROLLBACK'); // Rollback the transaction on error
    throw error; // Rethrow the error to the controller for handling
  } finally {
    client.release(); // Release the database connection
  }
};

// Model to get all train lines
export const getTrainLines = async () => {
  const result = await pool.query('SELECT * FROM subway_system.train_lines');
  return result.rows;
};

// Model to get a specific train line by its ID
export const getTrainLineById = async (lineId: number) => {
  const result = await pool.query('SELECT * FROM subway_system.train_lines WHERE id = $1', [lineId]);
  if (result.rowCount === 0) {
    throw new Error('Train line not found');
  }
  return result.rows[0];
};

// Model to get all stations associated with a specific train line
export const getStationsByLineId = async (lineId: number) => {
  const result = await pool.query(
    `SELECT s.name
     FROM subway_system.stations s
     JOIN subway_system.line_stations ls ON s.id = ls.station_id
     WHERE ls.line_id = $1
     ORDER BY ls.station_order`,
    [lineId]
  );
  return result.rows;
};
