const { Pool } = require('pg');

const pool = new Pool({
  user: '',       // add database username here
  host: '',       // add database hostname here
  database: '',   // add database name here
  password: '',   // add database password here
  port: 5432
});

module.exports = {
  // a generic used in a few places
  query: (text, params) => pool.query(text, params),

  addKeyToDB: (token, username, sensor_id) => {
    console.log(token, username, sensor_id);
    const query = 'INSERT INTO access_tokens (username, token, sensor, token_gen_date) VALUES ((SELECT id from users where username = $1), $2, $3, NOW()) RETURNING token;';
    values = [username, token, sensor_id];

    return pool.query(query, values);
  },
  addSensorToDB: (sensor) => {
    const query = 'INSERT INTO sensors (sensor_name) VALUES ($1) RETURNING id';
    const values = [sensor];

    return pool.query(query, values);
  },
  isKeyValid: (key) => {
    const query = 'SELECT sensor from access_tokens WHERE token = $1';
    const values = [key];

    return pool.query(query, values);
  },
  isKeyUsed: (key) => {
    const query = 'SELECT token from access_tokens where token = $1';
    const values = [key];

    return pool.query(query,values);
  },
  isUserValid: (username, password) => {
    const query = 'SELECT username from users where username = $1 and password = $2';
    const values = [username,password]

    return pool.query(query,values);
  }
};
