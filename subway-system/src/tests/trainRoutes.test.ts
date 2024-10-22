import request from 'supertest';
import app from '../index';


let server: any;
const uniqueSuffix = Date.now();  // Unique timestamp as suffix

beforeAll((done) => {
  server = app.listen(0, () => {  // Use a random available port
    console.log(`Testing server running on port ${server.address().port}`);
    done();
  });
}, 10000);

afterEach(async () => {
  // Clean up the test data created during the tests
  await request(app).delete(`/api/train-line/Test5_route_${uniqueSuffix}`);
});

afterAll((done) => {
  server.close(() => {
    console.log("Testing server closed");
    done();
  });
});

describe('Train Line Routes', () => {
  it('should create a new train line', async () => {
    const res = await request(app)
      .post('/api/train-line')
      .send({
        name: `Test5_route_${uniqueSuffix}`,  // Use unique name for each test
        stations: ['Times_Square', '34th_Street', '42nd_Street'],
        fare: 2.75
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.message).toEqual('Train line created successfully');
  });

  it('should fetch all train lines', async () => {
    const res = await request(app).get('/api/train-lines');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should fetch a specific train line by id', async () => {
    const res = await request(app).get(`/api/train-line/1`); // Assuming line 1 exists
    expect(res.statusCode).toEqual(200);
    expect(res.body.trainLine.name).toBeTruthy();
    expect(res.body.stations.length).toBeGreaterThan(0);
  });

});
