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
exports.exitStation = exports.enterStation = exports.createFareCard = void 0;
const database_1 = require("../database/database");
// Create or update a fare card
const createFareCard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { card_number, amount } = req.body;
    try {
        const cardResult = yield database_1.pool.query('INSERT INTO subway_system.fare_cards (card_number, balance) VALUES ($1, $2) ON CONFLICT (card_number) DO UPDATE SET balance = subway_system.fare_cards.balance + $2 RETURNING *', [card_number, amount]);
        res.status(201).json({
            message: 'Fare card created or updated successfully',
            card: cardResult.rows[0],
        });
    }
    catch (error) {
        console.error('Error creating or updating fare card:', error);
        res.status(500).json({ error: 'Failed to create or update fare card' });
    }
});
exports.createFareCard = createFareCard;
// Calculate fare based on the number of stations traveled
// function calculateFare(numStations: number): number {
//   const baseFare = 2.75;  // Base fare
//   const additionalCharge = 0.50;  // Charge per line change station beyond the first 1
//   const maxBaseStations = 1;
//   if (numStations <= maxBaseStations) {
//     return baseFare;
//   } else {
//     return baseFare + (numStations - maxBaseStations) * additionalCharge;
//   }
// }
const enterStation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { card_number } = req.body;
    const { origin_station } = req.params;
    console.log('origin', origin_station);
    console.log('card', card_number);
    if (!card_number || !origin_station) {
        return res.status(400).json({ error: 'Card number, origin are required' });
    }
    try {
        const station_ids = yield database_1.pool.query('select id from subway_system.stations where name = $1', [origin_station]);
        const station_id = station_ids.rows[0].id;
        const cardResult = yield database_1.pool.query('SELECT * FROM subway_system.fare_cards WHERE card_number = $1', [card_number]);
        if (cardResult.rowCount === 0) {
            return res.status(404).json({ error: 'Fare card not found' });
        }
        //console.log("card Result",cardResult);
        const card = cardResult.rows[0];
        //console.log("card",card);
        // Find the shortest route between the current station and the destination
        //const route = await findShortestRoute(origin_station, destination_station);
        //const numStations = route.length - 1;  // Number of stations between origin and destination
        //console.log("Route ",route);
        //console.log("numStations",numStations);
        //const fare = calculateFare(numStations);  // Calculate the fare based on the number of stations
        //console.log("Fare",fare);
        const fare = 2.75;
        if (card.balance < fare) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }
        const updatedCardResult = yield database_1.pool.query('UPDATE subway_system.fare_cards SET balance = balance - $1 WHERE card_number = $2 RETURNING *', [fare, card_number]);
        //console.log("card Updated",updatedCardResult);
        yield database_1.pool.query('INSERT INTO subway_system.ride_logs (card_id, station_id, entry_exit) VALUES ($1, $2, $3)', [card.id, station_id, 'entry']);
        res.status(200).json({
            message: 'Entry successful',
            fare,
            card: updatedCardResult.rows[0]
        });
    }
    catch (error) {
        console.error('Error processing station entry:', error);
        res.status(500).json({ error: 'Failed to process station entry' });
    }
});
exports.enterStation = enterStation;
// Station exit with fare card
const exitStation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { card_number } = req.body;
    const { destination_station } = req.params;
    if (!card_number || !destination_station) {
        return res.status(400).json({ error: 'Card number and station Name are required' });
    }
    try {
        const station_ids = yield database_1.pool.query('select id from subway_system.stations where name = $1', [destination_station]);
        const station_id = station_ids.rows[0].id;
        // Retrieve the fare card details
        const cardResult = yield database_1.pool.query('SELECT * FROM subway_system.fare_cards WHERE card_number = $1', [
            card_number,
        ]);
        if (cardResult.rowCount === 0) {
            return res.status(404).json({ error: 'Fare card not found' });
        }
        const card = cardResult.rows[0];
        // Log the station exit without deducting the fare (fare is only deducted during entry)
        yield database_1.pool.query('INSERT INTO subway_system.ride_logs (card_id, station_id, entry_exit) VALUES ($1, $2, $3)', [card.id, station_id, 'exit']);
        // Return the current balance (after fare was deducted at entry)
        return res.status(200).json({
            message: 'Exit successful',
            card,
        });
    }
    catch (error) {
        console.error('Error processing station exit:', error);
        return res.status(500).json({ error: 'Failed to process station exit' });
    }
});
exports.exitStation = exitStation;
