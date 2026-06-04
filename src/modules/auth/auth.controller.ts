import type { Request, Response } from "express";
import { authService } from "./auth.service";


const createUser = async (req: Request, res: Response) => {
    try {
        const result = await authService.createUserIntoDB(req.body);
        return res.status(201).json({
            "success": true,
            "message": "User registered successfully",
            "data": result.rows[0]
        })


    } catch (error: any) {
        return res.status(500).json({
            "success": false,
            "message": error.message,
            "data": error
        })
    }
}

const loginUser = async (req: Request, res: Response) => {
    try {
        const result = await authService.loginUserDB(req.body);
        return res.status(200).json({
            "success": true,
            "message": "Login successful",
            "data": result
        })


    } catch (error: any) {
        return res.status(500).json({
            "success": false,
            "message": error.message,
            "data": error
        })
    }
}



export const authController = {
    createUser,
    loginUser,
}