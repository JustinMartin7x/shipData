require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;

    beforeAll(async done => {
      execSync('npm run setup-db');

      client.connect();

      const signInData = await fakeRequest(app)
        .post('/auth/signup')
        .send({
          email: 'jon@user.com',
          password: '1234'
        });

      token = signInData.body.token;

      return done();
    });

    afterAll(done => {
      return client.end(done);
    });

    test('return rocinante information', async () => {

      const expectation =
      {
        id: 1,
        name: 'Rocinante',
        weapons: 3,
        docked: false,
        size: 'large',
        class: 'frigate',
        image: 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.reddit.com%2Fr%2Fblender%2Fcomments%2F9b2eii%2Frocinante_from_the_expanse%2F&psig=AOvVaw1mWqWugU8KNOX8PJ3ikpvt&ust=1604452518839000&source=images&cd=vfe&ved=0CAIQjRxqFwoTCPDfq8eZ5ewCFQAAAAAdAAAAABAD',
        owner_id: 1

      }
        ;

      const data = await fakeRequest(app)
        .get('/ships/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    test('return new ship', async () => {

      const expectation =
      {
        id: 3,
        name: 'ClearWater',
        weapons: 1,
        docked: false,
        size: 'small',
        class: 'corvette',
        image: 'random image here',
        owner_id: 1

      }
        ;

      const data = await fakeRequest(app)
        .post('/ships')
        .send({
          name: 'ClearWater',
          weapons: 1,
          docked: false,
          size: 'small',
          class: 'corvette',
          image: 'random image here',
          owner_id: 1

        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);

      const allShips = await fakeRequest(app)
        .get('/ships')
        .expect('Content-Type', /json/)
        .expect(200);
      expect(allShips.body.length).toEqual(3);

    });
    test('delete ship', async () => {

      const expectation =
      {
        id: 1,
        name: 'Rocinante',
        weapons: 3,
        docked: false,
        size: 'large',
        class: 'frigate',
        image: 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.reddit.com%2Fr%2Fblender%2Fcomments%2F9b2eii%2Frocinante_from_the_expanse%2F&psig=AOvVaw1mWqWugU8KNOX8PJ3ikpvt&ust=1604452518839000&source=images&cd=vfe&ved=0CAIQjRxqFwoTCPDfq8eZ5ewCFQAAAAAdAAAAABAD',
        owner_id: 1


      }
        ;

      const data = await fakeRequest(app)
        .delete('/ships/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });
  });
});
