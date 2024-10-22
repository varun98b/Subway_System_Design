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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../database/database");
const index_1 = __importDefault(require("../index"));
let server;
beforeAll((done) => {
    server = index_1.default.listen(0, () => {
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
    it('should connect to the database', () => __awaiter(void 0, void 0, void 0, function* () {
        const client = yield database_1.pool.connect();
        expect(client).toBeTruthy();
        client.release(); // Release the connection
    }));
    it('should query a table in the database', () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield database_1.pool.query('SELECT * FROM subway_system.train_lines');
        expect(result.rows.length).toBeGreaterThan(0);
    }));
});
