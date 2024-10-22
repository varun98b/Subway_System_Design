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
describe('Route Calculation', () => {
    it('should return the change of stations between two stations', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.default)
            .get('/api/route?origin=Chambers_Street&destination=West_4th_Street');
        expect(res.statusCode).toEqual(200);
        expect(res.body.route).toEqual(["Chambers_Street", "Times_Square", "Spring_Street", "West_4th_Street"]);
    }));
    it('should return an error when no route is found', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.default)
            .get('/api/route?origin=Unknown&destination=23rd_Street');
        expect(res.statusCode).toEqual(500);
        expect(res.body.error).toEqual('Failed to find route');
    }));
});
