import request from 'supertest';
import app from '../index';


let server: any;

beforeAll((done) => {
  server = app.listen(0, () => {  // Use a random available port
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
  it('should return the change of stations between two stations', async () => {
    const res = await request(app)
      .get('/api/route?origin=Times_Square&destination=14th_Street');
    expect(res.statusCode).toEqual(200);
    expect(res.body.route).toEqual(["Times_Square","34th_Street","14th_Street"]);
  });

  it('should return an error when no route is found', async () => {
    const res = await request(app)
      .get('/api/route?origin=Unknown&destination=23rd_Street');
    expect(res.statusCode).toEqual(500);
    expect(res.body.error).toEqual('Failed to find route');
  });
});
