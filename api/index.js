const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

// Serve the HTML form
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Email Search</title>
      </head>
      <body>
        <h1>Search for Student Email</h1>
        <form action="/search" method="get">
          <label for="query">Enter email:</label>
          <input type="text" id="query" name="q" required>
          <button type="submit">Search</button>
        </form>
        <div id="results"></div>
      </body>
    </html>
  `);
});

// Search route
app.get('/search', async (req, res) => {
  const query = req.query.q;
  try {
    const results = await pool.query(
      'SELECT * FROM students WHERE email ILIKE $1',
      [`%${query}%`]
    );

    let responseHtml = `
      <html>
        <head>
          <title>Search Results</title>
        </head>
        <body>
          <h1>Search Results for "${query}"</h1>
          <a href="/">Go back</a>
          <ul>
    `;

    if (results.rows.length > 0) {
      results.rows.forEach((row) => {
        responseHtml += `<li>${row.email} - ${row.name}</li>`;
      });
    } else {
      responseHtml += `<li>No results found</li>`;
    }

    responseHtml += `
          </ul>
        </body>
      </html>
    `;

    res.send(responseHtml);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Export the app for Vercel
module.exports = app;
