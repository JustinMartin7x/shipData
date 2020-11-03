const client = require('../lib/client');
// import our seed data:
const ships = require('./ships.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
          [user.email, user.hash]);
      })
    );

    const user = users[0].rows[0];

    await Promise.all(
      ships.map(ship => {
        return client.query(`
                    INSERT INTO ships (name, weapons, docked, image, size, class)
                    VALUES ($1, $2, $3, $4, $5, $6);
                `,
          [ship.name, ship.weapons, ship.docked, ship.image, ship.size, ship.class]);
      })
    );


    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch (err) {
    console.log(err);
  }
  finally {
    client.end();
  }

}
