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
exports.getStationsByLineId = exports.getTrainLineById = exports.getTrainLines = exports.createTrainLine = void 0;
const database_1 = require("../database/database");
// Model to create a new train line
const createTrainLine = (name, fare, stations) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield database_1.pool.connect(); // Connect to the database
    try {
        yield client.query('BEGIN'); // Start a transaction
        // Insert the train line and get the newly inserted line's ID
        const lineResult = yield client.query('INSERT INTO subway_system.train_lines (name, fare) VALUES ($1, $2) RETURNING id', [name, fare]);
        const lineId = lineResult.rows[0].id;
        // Insert the stations into the line_stations table with their order
        const stationInsertQueries = stations.map((stationName, index) => client.query('INSERT INTO subway_system.line_stations (line_id, station_id, station_order) VALUES ($1, (SELECT id FROM stations WHERE name = $2), $3)', [lineId, stationName, index + 1]));
        // Execute all station insertions in parallel
        yield Promise.all(stationInsertQueries);
        yield client.query('COMMIT'); // Commit the transaction
        return { message: 'Train line created successfully', lineId };
    }
    catch (error) {
        yield client.query('ROLLBACK'); // Rollback the transaction on error
        throw error; // Rethrow the error to the controller for handling
    }
    finally {
        client.release(); // Release the database connection
    }
});
exports.createTrainLine = createTrainLine;
// Model to get all train lines
const getTrainLines = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield database_1.pool.query('SELECT * FROM subway_system.train_lines');
    return result.rows;
});
exports.getTrainLines = getTrainLines;
// Model to get a specific train line by its ID
const getTrainLineById = (lineId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield database_1.pool.query('SELECT * FROM subway_system.train_lines WHERE id = $1', [lineId]);
    if (result.rowCount === 0) {
        throw new Error('Train line not found');
    }
    return result.rows[0];
});
exports.getTrainLineById = getTrainLineById;
// Model to get all stations associated with a specific train line
const getStationsByLineId = (lineId) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield database_1.pool.query(`SELECT s.name
     FROM subway_system.stations s
     JOIN subway_system.line_stations ls ON s.id = ls.station_id
     WHERE ls.line_id = $1
     ORDER BY ls.station_order`, [lineId]);
    return result.rows;
});
exports.getStationsByLineId = getStationsByLineId;
