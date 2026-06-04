import bcrypt from "bcryptjs";
import type { IUser } from "./auth.interface";
import { pool } from "../../db";
import { log } from "console";
import config from "../../config";
import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';


const createUserIntoDB = async ({ name, email, password, role }: IUser) => {
    console.log({ name, email, password, role });

    const hashPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(`
        INSERT INTO users (name , email , password , role) 
        VALUES ($1,$2,$3,COALESCE($4,'contributor'))
        RETURNING *
    `, [name, email, hashPassword, role]);
    delete result.rows[0].password;
    return result;
}


const loginUserDB = async ({ email, password }: { email: string, password: string }) => {

    const userData = await pool.query(`
        SELECT * FROM users WHERE email=$1
    `, [email]);
    if (userData.rows.length === 0) throw Error('Something Went Wrong');
    const user = userData.rows[0];
    const matchePassword = await bcrypt.compare(password, user.password);
    if (matchePassword === false) throw Error('Something Went Wrong');

    const jwtPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
    }
    const expireDate = {
        expiresIn: "1d",
    }
    const token = jwt.sign(jwtPayload, config.secret as string, expireDate as SignOptions);
    delete user.password;
    return { token, user }
}



export const authService = {
    createUserIntoDB: createUserIntoDB,
    loginUserDB: loginUserDB,
}
