const client = require('../lib/client');
// import our seed data:
const classes = require('./classes.js');
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


    //im using booger because class is a protected word and it ticked me off. it took us 5 minutes to realize this was 
    await Promise.all(
      classes.map(booger => {
        return client.query(`
                        INSERT INTO classes (name)
                        VALUES ($1);
                    `,
          [booger.name]);
      })
    );

    const user = users[0].rows[0];

    await Promise.all(
      ships.map(ship => {
        return client.query(`
                    INSERT INTO ships (name, weapons, docked, image, size, class_id, owner_id)
                    VALUES ($1, $2, $3, $4, $5, $6, $7);
                `,
          [ship.name, ship.weapons, ship.docked, ship.image, ship.size, ship.class_id, user.id]);
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
