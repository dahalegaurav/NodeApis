const express = require('express');
const { Pool } = require('pg');
const app = express();
const port = 8080;

// PostgreSQL connection setup
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'Practice',
  password: '2001',
  port: 5432,
});

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Server is Ready!');
});

app.post('/signup', async (req, res) => {
  const { username, email, phone_number, password } = req.body;

  if (!username || !email || !phone_number || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM practice.signup($1, $2, $3, $4)',
      [username, email, phone_number, password]
    );

    const message = result.rows[0].p_message;

    // Check if message contains the word 'failed'
    if (message.toLowerCase().includes('failed')) {
      res.status(500).json({ message });
    } else {
      res.status(201).json({ message });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.post('/signin', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    // Query user by username
    const result = await pool.query(
      'SELECT * FROM practice.users WHERE username = $1 AND password = $2',
      [username, password]
    );

    if (result.rows.length > 0) {
      
      res.status(200).json({ message: 'Authorized' });
    } else {
      // No match found
      res.status(401).json({ message: 'Unauthorized' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
