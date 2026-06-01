import express, { type Application, type Request, type Response } from 'express';
import { Pool } from 'pg';

const app: Application = express()
const port = 8080

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({
    extended: true
}));


const pool = new Pool({
    connectionString: "postgresql://neondb_owner:npg_xTiBjyM4RN2v@ep-morning-mouse-aqixsz45-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
    ssl: {
        rejectUnauthorized: false
    },
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 10000,
});



const initDB = async () => {
    try {
        await pool.query(`
            CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(20),
            email VARCHAR(20) UNIQUE NOT NULL,
            password VARCHAR(20) NOT NULL,
            is_avtive BOOLEAN DEFAULT true, 
            age INT , 
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            );
        `);
        console.log('Database connected successfully!');
    }
    catch (err) {
        console.log(err);
    }
}

initDB();

app.get('/', (req: Request, res: Response) => {
    // res.send('Express Server')
    res.status(200).json({
        "message": 'Express Server',
        "author": "Next Level"
    });
})

app.post("/api/users", async (req: Request, res: Response) => {

    try {
        const { name, email, password, age } = req.body;

        const result = await pool.query(`
        INSERT INTO users (name, email, password , age)
        VALUES ($1 , $2 , $3 , $4)
        RETURNING *
    `, [name, email, password, age]);

        return res.status(201).json({
            "message": "User Created Successfully!",
            'data': result.rows[0]
        })
    } catch (error: any) {
        res.status(500).json({
            "message": error.message,
            "data": error
        })
    }
})


app.get('/api/users', async (req: Request, res: Response) => {
    try {
        const result = await pool.query(`
        SELECT * FROM users
    `);
        res.status(200).json({
            "success": true,
            "message": "Users List",
            "data": result.rows
        })
    } catch (error: any) {
        res.status(500).json({
            "success": false,
            "message": error.message,
            "data": error
        })
    }

})

app.get('/api/user/:id', async (req: Request, res: Response) => {
    const id = req.params.id;
    try {
        const result = await pool.query(`
        SELECT * FROM users WHERE id=$1
    `, [id]);

        if (result.rows.length == 0) {
            res.status(404).json({
                "success": false,
                "message": "Single User",
                "data": "User Not Found"
            })
        }
        else {
            res.status(200).json({
                "success": true,
                "message": "Single User",
                "data": result.rows[0]
            })
        }

    } catch (error: any) {
        res.status(500).json({
            "success": false,
            "message": error.message,
            "data": error
        })
    }
})

app.put('/api/user/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, password, age, is_active } = req.body;

    console.log(id);
    console.log({ name, password, age, is_active });
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})