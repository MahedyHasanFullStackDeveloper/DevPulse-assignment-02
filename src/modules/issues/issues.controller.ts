
import type { Request, Response } from "express";
import { issueService } from "./issues.service";



const createIssues = async (req: Request, res: Response) => {
    try {
        const result = await issueService.createIssueIntoDB(req.body, req.user!);
        return res.status(200).json({
            "success": true,
            "message": "Issue created successfully",
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


const getIssues = async (req: Request, res: Response) => {
    try {
        const query = req.query.sort || req.query.type || req.query.status || 'newest';
        const result = await issueService.getAllIssuesDB(query as string);
        return res.status(200).json({
            "success": true,
            "message": "Issues retrived successfully",
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



const getSingleIssues = async (req: Request, res: Response) => {
    try {
        const params = req.params.id;
        const result = await issueService.getSingleIssuesDB(params as string);
        return res.status(200).json({
            "success": true,
            "message": "Issue retrived successfully",
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
    getIssues,
    getSingleIssues
}