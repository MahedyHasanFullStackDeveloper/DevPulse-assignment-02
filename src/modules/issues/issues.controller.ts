
import type { Request, Response } from "express";
import { issueService } from "./issues.service";



const createIssues = async (req: Request, res: Response) => {
    try {
        const result = await issueService.createIssueIntoDB(req.body);
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


export const issuesController = {
    createIssues,
}