"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const trainController_1 = require("../controllers/trainController");
const cardController_1 = require("../controllers/cardController");
const router = express_1.default.Router();
// Train Line Routes
router.post('/train-line', trainController_1.addTrainLine); // Create a new train line
router.get('/train-lines', trainController_1.fetchAllTrainLines); // Fetch all train lines
router.get('/train-line/:id', trainController_1.fetchTrainLineById); // Fetch a train line by ID
router.get('/route', trainController_1.getRoute); // Fetch the shortest route between two stations
// Fare Card Routes
router.post('/card', cardController_1.createFareCard); // Create or update fare card
router.post('/station/:origin_station/enter', cardController_1.enterStation); // Enter a station
router.post('/station/:destination_station/exit', cardController_1.exitStation); // Exit a station
exports.default = router;
