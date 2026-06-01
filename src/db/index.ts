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
            CREATE TYPE role_type AS ENUM(
                'contributor',
                'maintainer'
            )
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(20),
                email VARCHAR(20) UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role role_type NOT NULL DEFAULT 'contributor',
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);

        await pool.query(`
            CREATE TYPE issue_type AS ENUM(
                'bug',
                'feature_request'
            )
            CREATE TYPE status_type AS ENUM(
                'open',
                'in_progress',
                'resolved'
            )
            CREATE TABLE IF NOT EXISTS issues (
                id SERIAL PRIMARY KEY,
                title VARCHAR(128),
                description TEXT(),
                type issue_type NOT NULL DEFAULT 'bug',
                status status_type NOT NULL DEFAULT 'open',
                reporter_id INT REFERENCES users(id) ON DELETE CASCADE ,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `)

    } catch (error) {
        console.log('Database error:', error);
    }
}

