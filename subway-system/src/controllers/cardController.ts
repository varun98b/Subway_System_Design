import { Request, Response } from 'express';
import { pool } from '../database/database';
import { findShortestRoute } from './trainController';  // Import the route function


// Create or update a fare card
export const createFareCard = async (req: Request, res: Response) => {
  const { card_number, amount } = req.body;

  try {
    const cardResult = await pool.query(
      'INSERT INTO subway_system.fare_cards (card_number, balance) VALUES ($1, $2) ON CONFLICT (card_number) DO UPDATE SET balance = subway_system.fare_cards.balance + $2 RETURNING *',
      [card_number, amount]
    );
    res.status(201).json({
      message: 'Fare card created or updated successfully',
      card: cardResult.rows[0],
    });
  } catch (error) {
    console.error('Error creating or updating fare card:', error);
    res.status(500).json({ error: 'Failed to create or update fare card' });
  }
};

export const enterStation = async (req: Request, res: Response) => {
  const { card_number } = req.body;
  const { origin_station } = req.params;
  console.log('origin',origin_station);
  console.log('card',card_number);

  if (!card_number || !origin_station ) {
    return res.status(400).json({ error: 'Card number, origin are required' });
  }

  try {
    const station_ids= await pool.query('select id from subway_system.stations where name = $1', [origin_station]);
    const station_id = station_ids.rows[0].id;
    const cardResult = await pool.query('SELECT * FROM subway_system.fare_cards WHERE card_number = $1', [card_number]);
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

    const updatedCardResult = await pool.query('UPDATE subway_system.fare_cards SET balance = balance - $1 WHERE card_number = $2 RETURNING *', [fare, card_number]);
    //console.log("card Updated",updatedCardResult);
    await pool.query('INSERT INTO subway_system.ride_logs (card_id, station_id, entry_exit) VALUES ($1, $2, $3)', [card.id, station_id, 'entry']);

    res.status(200).json({
      message: 'Entry successful',
      fare,
      card: updatedCardResult.rows[0]
    });
  } catch (error) {
    console.error('Error processing station entry:', error);
    res.status(500).json({ error: 'Failed to process station entry' });
  }
};



// Station exit with fare card
export const exitStation = async (req: Request, res: Response) => {
  const { card_number } = req.body;
  const { destination_station } = req.params;

  if (!card_number || !destination_station) {
    return res.status(400).json({ error: 'Card number and station Name are required' });
  }

  try {
    const station_ids= await pool.query('select id from subway_system.stations where name = $1', [destination_station]);
    const station_id = station_ids.rows[0].id;
    // Retrieve the fare card details
    const cardResult = await pool.query('SELECT * FROM subway_system.fare_cards WHERE card_number = $1', [
      card_number,
    ]);

    if (cardResult.rowCount === 0) {
      return res.status(404).json({ error: 'Fare card not found' });
    }

    const card = cardResult.rows[0];

    // Log the station exit without deducting the fare (fare is only deducted during entry)
    await pool.query(
      'INSERT INTO subway_system.ride_logs (card_id, station_id, entry_exit) VALUES ($1, $2, $3)',
      [card.id, station_id, 'exit']
    );

    // Return the current balance (after fare was deducted at entry)
    return res.status(200).json({
      message: 'Exit successful',
      card,
    });
  } catch (error) {
    console.error('Error processing station exit:', error);
    return res.status(500).json({ error: 'Failed to process station exit' });
  }
};
