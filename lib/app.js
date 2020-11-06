const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');
const ships = require('../data/ships.js');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/ships', async (req, res) => {
  try {
    const data = await client.query(`
      SELECT ships.id, ships.name, ships.weapons, ships.docked, ships.size, ships.image, classes.name as class_id
      FROM ships
      JOIN classes
      on classes.id = ships.class_id
      ORDER by classes.name desc`);

    res.json(data.rows);
  } catch (e) {

    res.status(500).json({ error: e.message });
  }
});
app.get('ships/:id', async (req, res) => {
  try {
    const shipsId = req.params.id;
    const data = await client.query(`
    SELECT 
        ships.id, 
        ships.name,
        ships.weapons,
        ships.docked,
        ships.size,
        ships.image,
        classes.name as class_id
        ships.owner_id,
      FROM ships
      JOIN classes
      ON classes.id = ships.class_id
      WHERE classes.id = $1

    `, [shipsId]);
    res.json(data.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.get('/classes', async (req, res) => {
  try {
    const data = await client.query(`
    SELECT * FROM classes;`);
    res.json(data.rows);

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/ships', async (req, res) => {
  try {
    const newName = req.body.name;
    const newWeapons = req.body.weapons;
    const newDocked = req.body.docked;
    const newSize = req.body.size;
    const newClass = req.body.class_id;
    const newImage = req.body.image;
    const newOwner = req.body.owner_id;


    const data = await client.query(`
    INSERT INTO ships (name, weapons, docked, size, class_id, image, owner_id)
    VALUES($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
      `,
      [newName, newWeapons, newDocked, newSize, newClass, newImage, newOwner]);
    res.json(data.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.put('/ships/:id', async (req, res) => {
  try {

    const newName = req.body.name;
    const newWeapons = req.body.weapons;
    const newDocked = req.body.docked;
    const newSize = req.body.size;
    const newClass = req.body.class_id;
    const newImage = req.body.image;

    const data = await client.query(`
              UPDATE ships
              SET name = $1, 
              weapons = $2,
              size = $3,
              class_id = $4,
              docked = $5,
              image = $6
              WHERE ships.id = $7
              RETURNING *;
            `,

      [newName, newWeapons, newDocked, newSize, newClass, newImage, req.params.id]);

    res.json(data.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/ships/:id', async (req, res) => {
  try {
    const shipsId = req.params.id;

    const data = await client.query(`
                DELETE from ships 
                WHERE ships.id=$1
                RETURNING *
              `,

      [shipsId]);

    res.json(data.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


app.use(require('./middleware/error'));

module.exports = app;

