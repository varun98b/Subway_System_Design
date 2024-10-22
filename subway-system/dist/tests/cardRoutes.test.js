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
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../index"));
let server;
beforeAll((done) => {
    server = index_1.default.listen(0, () => {
        console.log(`Testing server running on port ${server.address().port}`);
        done();
    });
}, 10000);
afterAll((done) => {
    server.close(() => {
        console.log("Testing server closed");
        done();
    });
});
describe('Fare Card Routes', () => {
    it('should create or update a fare card', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.default)
            .post('/api/card')
            .send({
            card_number: '1234567890',
            amount: 50.00
        });
        expect(res.statusCode).toEqual(201);
        expect(res.body.message).toEqual('Fare card created or updated successfully');
    }));
    it('should allow entering a station and deducting the fare', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.default)
            .post('/api/station/6/enter')
            .send({
            card_number: '1234567890',
            destination_station: 'West_4th_Street'
        });
        console.log('Response:', res.status, res.body);
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toEqual('Entry successful');
        expect(res.body.fare).toBeTruthy();
    }));
    it('should not allow entry with insufficient balance', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.default)
            .post('/api/station/1/enter')
            .send({
            card_number: '5555555555',
            destination_station: '34th_Street'
        });
        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toEqual('Insufficient balance');
    }));
    it('should log station exit', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.default)
            .post('/api/station/3/exit')
            .send({
            card_number: '1234567890'
        });
        expect(res.statusCode).toEqual(200);
        expect(res.body.message).toEqual('Exit successful');
    }));
});
