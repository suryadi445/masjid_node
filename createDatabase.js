// createDatabase.js
const { Client } = require("pg");
require("dotenv").config();

async function createDatabase() {
  const client = new Client({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
  });

  await client.connect();

  const dbName = process.env.DB_NAME;

  try {
    const res = await client.query(
      `SELECT 1 FROM pg_database WHERE datname='${dbName}'`
    );
    if (res.rowCount === 0) {
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database "${dbName}" created!`);
    } else {
      console.log(`Database "${dbName}" already exists.`);
    }
  } catch (error) {
    console.error("Error creating database:", error);
  } finally {
    await client.end();
  }
}

createDatabase();
