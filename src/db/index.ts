import { Pool } from "pg";
import config from "../config";


export const pool = new Pool({
    connectionString: config.connection_string,
    ssl: {
        rejectUnauthorized: false
    },
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 10000,
});


export const initDB = async () => {

    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(64) NOT NULL,
                email VARCHAR(64) UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role VARCHAR(64) NOT NULL DEFAULT 'contributor',
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS issues (
                id SERIAL PRIMARY KEY,
                title VARCHAR(128) NOT NULL,
                description TEXT NOT NULL,
                type VARCHAR(64) NOT NULL DEFAULT 'bug',
                status  VARCHAR(64) NOT NULL DEFAULT 'open',
                reporter_id INT REFERENCES users(id) ON DELETE CASCADE ,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `)

    } catch (error) {
        console.log('Database error:', error);
    }
}

