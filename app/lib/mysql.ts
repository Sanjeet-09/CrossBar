import mysql from 'mysql2/promise';

const databaseUrl = process.env.MYSQL_DATABASE_URL;

if (!databaseUrl) {
  throw new Error('Missing MYSQL_DATABASE_URL environment variable in .env.local');
}

export const mysqlPool = mysql.createPool(databaseUrl);
