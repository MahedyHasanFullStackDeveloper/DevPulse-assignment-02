import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from 'jsonwebtoken'
import { pool } from "../db";
import config from "../config";



const auth = (...roles: any) => {

    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.headers.authorization;
            if (!token) {
                return res.status(401).json({
                    "success": false,
                    "message": "Unauthorized access!",
                })
            }
            const decoded = jwt.verify(token, config.secret as string) as JwtPayload;
            const userData = await pool.query(`
                SELECT * FROM users WHERE email=$1
            `, [decoded.email])
            if (userData.rows.length == 0) {
                return res.status(401).json({
                    "success": false,
                    "message": "Unauthorized access!",
                })
            }
            // if (roles.length && !roles.includes(user.role)) {
            //     return res.status(403).json({
            //         'success': false,
            //         'message': "access forbidden!"
            //     })
            // }
            req.user = decoded;
            next();
        } catch (error) {
            next(error);
        }
    }
}

export default auth; 