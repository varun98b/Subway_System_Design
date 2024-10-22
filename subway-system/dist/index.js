"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes/routes"));
const database_1 = require("./database/database");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use(body_parser_1.default.json());
// Root route
app.get('/', (req, res) => {
    res.send('Subway System API is running!');
});
// API routes
app.use('/api', routes_1.default);
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
// Ensure the database connection is working before starting
database_1.pool.connect()
    .then(() => {
    console.log('Connected to the database');
})
    .catch((err) => {
    console.error('Database connection error:', err);
});
// Export the app instance for testing
exports.default = app;
