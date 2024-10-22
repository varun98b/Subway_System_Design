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


describe('Fare Card Routes', () => {
  it('should create or update a fare card', async () => {
    const res = await request(app)
      .post('/api/card')
      .send({
        card_number: '1234567890',
        amount: 50.00
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body.message).toEqual('Fare card created or updated successfully');
  });

  it('should allow entering a station and deducting the fare', async () => {
    const res = await request(app)
      .post('/api/station/Times_Square/enter')
      .send({
        card_number: '1234567890'
      });
    console.log('Response:', res.status, res.body);
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Entry successful');
    expect(res.body.fare).toBeTruthy();
  });

  it('should not allow entry with insufficient balance', async () => {
    const res = await request(app)
      .post('/api/station/Times_Square/enter')
      .send({
        card_number: '5555555555',  // Card with insufficient balance
        destination_station: '34th_Street'
      });
    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toEqual('Insufficient balance');
  });

  it('should log station exit', async () => {
    const res = await request(app)
      .post('/api/station/14th_Street/exit')
      .send({
        card_number: '1234567890'
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Exit successful');
  });
});
