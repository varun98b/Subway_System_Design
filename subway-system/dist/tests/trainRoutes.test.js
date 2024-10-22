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
const uniqueSuffix = Date.now(); // Unique timestamp as suffix
beforeAll((done) => {
    server = index_1.default.listen(0, () => {
        console.log(`Testing server running on port ${server.address().port}`);
        done();
    });
}, 10000);
afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
    // Clean up the test data created during the tests
    yield (0, supertest_1.default)(index_1.default).delete(`/api/train-line/Test5_route_${uniqueSuffix}`);
}));
afterAll((done) => {
    server.close(() => {
        console.log("Testing server closed");
        done();
    });
});
describe('Train Line Routes', () => {
    it('should create a new train line', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.default)
            .post('/api/train-line')
            .send({
            name: `Test5_route_${uniqueSuffix}`,
            stations: ['Times_Square', '34th_Street', '42nd_Street'],
            fare: 2.75
        });
        expect(res.statusCode).toEqual(201);
        expect(res.body.message).toEqual('Train line created successfully');
    }));
    it('should fetch all train lines', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.default).get('/api/train-lines');
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toBeGreaterThan(0);
    }));
    it('should fetch a specific train line by id', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.default).get(`/api/train-line/1`); // Assuming line 1 exists
        expect(res.statusCode).toEqual(200);
        expect(res.body.trainLine.name).toBeTruthy();
        expect(res.body.stations.length).toBeGreaterThan(0);
    }));
    // Uncomment and update this test if needed
    /*
    it('should return the optimal route between two stations', async () => {
      const res = await request(app)
        .get('/api/route?origin=Times_Square&destination=14th_Street');
  
      expect(res.statusCode).toEqual(200);
      expect(res.body.route).toEqual(['Times Square', '34th Street', '14th Street']);
    });
    */
});
