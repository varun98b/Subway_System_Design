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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoute = exports.findShortestRoute = exports.fetchTrainLineById = exports.fetchAllTrainLines = exports.addTrainLine = void 0;
const lineModel_1 = require("../models/lineModel");
const database_1 = require("../database/database");
// Create a new train line
const addTrainLine = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, fare, stations } = req.body;
    try {
        const result = yield (0, lineModel_1.createTrainLine)(name, fare, stations);
        res.status(201).json(result);
    }
    catch (error) {
        console.error('Error creating train line:', error);
        res.status(500).json({ error: 'Failed to create train line' });
    }
});
exports.addTrainLine = addTrainLine;
// Get all train lines
const fetchAllTrainLines = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const lines = yield (0, lineModel_1.getTrainLines)();
        res.status(200).json(lines);
    }
    catch (error) {
        console.error('Error fetching train lines:', error);
        res.status(500).json({ error: 'Failed to fetch train lines' });
    }
});
exports.fetchAllTrainLines = fetchAllTrainLines;
// Get a specific train line and its stations by ID
const fetchTrainLineById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const lineId = parseInt(req.params.id, 10);
    try {
        const trainLine = yield (0, lineModel_1.getTrainLineById)(lineId);
        const stations = yield (0, lineModel_1.getStationsByLineId)(lineId);
        res.status(200).json({ trainLine, stations });
    }
    catch (error) {
        console.error('id=', lineId);
        console.error('Error fetching train line:', error);
        res.status(500).json({ error: 'Failed to fetch train line' });
    }
});
exports.fetchTrainLineById = fetchTrainLineById;
function getNeighbors(stationName) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = `
    SELECT s2.name
    FROM subway_system.stations s1
    JOIN subway_system.line_stations ls1 ON s1.id = ls1.station_id
    JOIN subway_system.line_stations ls2 ON ls1.line_id = ls2.line_id 
    JOIN subway_system.stations s2 ON s2.id = ls2.station_id
    WHERE s1.name = $1
    AND (ls2.station_order = ls1.station_order + 1 OR ls2.station_order = ls1.station_order - 1);
  `;
        const result = yield database_1.pool.query(query, [stationName]);
        return result.rows.map((row) => row.name);
    });
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
function findShortestRoute(origin, destination) {
    return __awaiter(this, void 0, void 0, function* () {
        const queue = [[origin]];
        const visited = new Set([origin]);
        while (queue.length > 0) {
            const path = queue.shift();
            const station = path[path.length - 1];
            if (station === destination) {
                return path; // Return the shortest path when destination is found
            }
            const neighbors = yield getNeighbors(station);
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push([...path, neighbor]); // Add neighbor to path
                }
            }
        }
        throw new Error('No route found between stations');
    });
}
exports.findShortestRoute = findShortestRoute;
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
const getRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { origin, destination } = req.query;
    console.log("origin", origin);
    console.log("destination", destination);
    if (!origin || !destination) {
        return res.status(400).json({ error: 'Origin and destination are required' });
    }
    try {
        const route = yield findShortestRoute(origin, destination);
        return res.status(200).json({ route });
    }
    catch (error) {
        //console.error('Error finding route:', error);
        return res.status(500).json({ error: 'Failed to find route' });
    }
});
exports.getRoute = getRoute;
