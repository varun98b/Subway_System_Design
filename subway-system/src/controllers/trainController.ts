import { Request, Response } from 'express';
import { createTrainLine, getTrainLines, getTrainLineById, getStationsByLineId } from '../models/lineModel';
import { pool } from '../database/database';


// Create a new train line
export const addTrainLine = async (req: Request, res: Response) => {
  const { name, fare, stations } = req.body;

  try {
    const result = await createTrainLine(name, fare, stations);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating train line:', error);
    res.status(500).json({ error: 'Failed to create train line' });
  }
};

// Get all train lines
export const fetchAllTrainLines = async (req: Request, res: Response) => {
  try {
    const lines = await getTrainLines();
    res.status(200).json(lines);
  } catch (error) {
    console.error('Error fetching train lines:', error);
    res.status(500).json({ error: 'Failed to fetch train lines' });
  }
};

// Get a specific train line and its stations by ID
export const fetchTrainLineById = async (req: Request, res: Response) => {
  const lineId = parseInt(req.params.id, 10);

  try {
    const trainLine = await getTrainLineById(lineId);
    const stations = await getStationsByLineId(lineId);

    res.status(200).json({ trainLine, stations });
  } catch (error) {
    console.error('id=',lineId);
    console.error('Error fetching train line:', error);
    res.status(500).json({ error: 'Failed to fetch train line' });
  }
};

async function getNeighbors(stationName: string): Promise<string[]> {
  const query = `
    SELECT s2.name
    FROM subway_system.stations s1
    JOIN subway_system.line_stations ls1 ON s1.id = ls1.station_id
    JOIN subway_system.line_stations ls2 ON ls1.line_id = ls2.line_id 
    JOIN subway_system.stations s2 ON s2.id = ls2.station_id
    WHERE s1.name = $1
    AND (ls2.station_order = ls1.station_order + 1 OR ls2.station_order = ls1.station_order - 1);
  `;
  const result = await pool.query(query, [stationName]);
  return result.rows.map((row: { name: string }) => row.name);
}

/*
// Helper function to find neighbors of a station (connected stations)
async function getNeighbors(stationName: string): Promise<string[]> {
  const query = `
    SELECT s2.name
    FROM subway_system.stations s1
    JOIN subway_system.line_stations ls1 ON s1.id = ls1.station_id
    JOIN subway_system.line_stations ls2 ON ls1.line_id = ls2.line_id AND ls1.station_order != ls2.station_order
    JOIN subway_system.stations s2 ON s2.id = ls2.station_id
    WHERE s1.name = $1;
  `;
  const result = await pool.query(query, [stationName]);
  return result.rows.map((row: { name: string }) => row.name);
}
*/

// Function to find the shortest route using BFS, with ordered station traversal
export async function findShortestRoute(origin: string, destination: string): Promise<string[]> {
  const queue: string[][] = [[origin]];
  const visited: Set<string> = new Set([origin]);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const station = path[path.length - 1];

    if (station === destination) {
      return path;  // Return the shortest path when destination is found
    }

    const neighbors = await getNeighbors(station);

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);  // Add neighbor to path
      }
    }
  }

  throw new Error('No route found between stations');
}

/*
export async function findShortestRoute(origin: string, destination: string): Promise<string[]> {
  const queue: string[][] = [[origin]];
  const visited: Set<string> = new Set([origin]);
  //console.log("origin", origin);
  //console.log("destination",destination);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const station = path[path.length - 1];

    if (station === destination) {
      return path;  // Return the shortest path when destination is found
    }

    const neighbors = await getNeighbors(station);

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);  // Add neighbor to path
      }
    }
  }

  throw new Error('No route found between stations');
}
*/


// GET /route?origin=[origin]&destination=[destination]
export const getRoute = async (req: Request, res: Response) => {
  const { origin, destination } = req.query;
  console.log("origin",origin);
  console.log("destination",destination);
  if (!origin || !destination) {
    return res.status(400).json({ error: 'Origin and destination are required' });
  }

  try {
    const route = await findShortestRoute(origin as string, destination as string);
    return res.status(200).json({ route });
  } catch (error) {
    //console.error('Error finding route:', error);
    return res.status(500).json({ error: 'Failed to find route' });
  }
};

