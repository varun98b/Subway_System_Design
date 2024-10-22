import express from 'express';
import { addTrainLine, fetchAllTrainLines, fetchTrainLineById, getRoute } from '../controllers/trainController';
import { enterStation,exitStation,createFareCard } from '../controllers/cardController'

const router = express.Router();

// Train Line Routes
router.post('/train-line', addTrainLine);  // Create a new train line
router.get('/train-lines', fetchAllTrainLines);  // Fetch all train lines
router.get('/train-line/:id', fetchTrainLineById);  // Fetch a train line by ID
router.get('/route', getRoute);  // Fetch the shortest route between two stations


// Fare Card Routes
router.post('/card', createFareCard);  // Create or update fare card
router.post('/station/:origin_station/enter', enterStation);  // Enter a station
router.post('/station/:destination_station/exit', exitStation);  // Exit a station


export default router;
