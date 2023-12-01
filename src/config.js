import { config } from 'dotenv';
import pg from 'pg';

const envFile =
    process.env.NODE_ENV === 'production'
        ? '.env.production'
        : '.env.development';
config({ path: envFile });

const pool = new pg.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

export default pool;
