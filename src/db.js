const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
})

async function createTableIfNotExist(){
    const result = await pool.query(` CREATE TABLE IF NOT EXISTS Contact(
        id                SERIAL PRIMARY KEY,
        phoneNumber       VARCHAR(15),
        email             VARCHAR(50),
        linkedId          INTEGER,
        linkPrecedence  VARCHAR(20),
        createdAt         TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updatedAt         TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        deletedAt         TIMESTAMPTZ
      );`)

      console.log("Created TABLE CONTACT", result.rows);
}

createTableIfNotExist()

module.exports = pool;