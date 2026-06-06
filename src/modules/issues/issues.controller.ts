
import type { Request, Response } from "express";
import { issueService } from "./issues.service";
import { pool } from "../../db";



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




const updateSingleIssues = async (req: Request, res: Response) => {
    try {
        const params = req.params.id;
        const userData = req.user;

        if (userData?.role !== 'maintainer') {
            const issue = await pool.query(`
                SELECT * from issues where id=$1
            `, [params]);

            const tissue = issue.rows[0]

            if (tissue.length == 0) {
                throw Error('Issue Not Found');
            }

            if (tissue.status !== 'open') {
                throw Error('Issue Is Not Open!');
            }

            if (tissue.reporter_id != userData?.id) {
                throw Error("This Is Not Your Issue!");
            }

            const { title, description, type } = req.body

            const result = await issueService.updateSingleIssuesDB(params as string, { title, description, type });
            return res.status(200).json({
                "success": true,
                "message": "Issue updated successfully",
                "data": result.rows[0]
            })
        }

        const result = await issueService.updateSingleIssuesDB(params as string, req.body);
        return res.status(200).json({
            "success": true,
            "message": "Issue updated successfully",
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


const deleteSingleIssues = async (req: Request, res: Response) => {
    try {
        const params = req.params.id;
        const userData = req.user;

        if (userData?.role !== 'maintainer') {
            throw Error("Role Must Be Maintainer");
        }

        const result = await issueService.deleteSingleIssuesDB(params as string);
        return res.status(200).json({
            "success": true,
            "message": "Issue deleted successfully"
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
    getSingleIssues,
    updateSingleIssues,
    deleteSingleIssues
}