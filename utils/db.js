import knexObj from "knex";
import dotenv from "dotenv";
dotenv.config();

const decodeDBHOST = Buffer.from(
  process.env.DBHOST,
  "base64"
).toString("utf-8");

const decodeDBPASS = Buffer.from(
  process.env.DBPASS,
  "base64"
).toString("utf-8");

const knex = knexObj({
  client: process.env.DBCLIENT || "mysql2",
  connection: {
    host: decodeDBHOST || "localhost",
    port: process.env.DBPORT || 33061,
    user: process.env.DBUSER || "root",
    password: decodeDBPASS || "root",
    database: process.env.DBNAME || "e_paper",
    ssl: { rejectUnauthorized: false }
  },
  pool: { min: 0, max: 7 },
});
export default knex;