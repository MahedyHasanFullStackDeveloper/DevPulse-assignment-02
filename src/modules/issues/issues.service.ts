import { pool } from "../../db";
import type { IUser } from "../auth/auth.interface";
import type { Iissue } from "./issues.interface";

const createIssueIntoDB = async (payload: Iissue, user: IUser) => {
    const { title, description, type, status } = payload;
    const result = await pool.query(`
            INSERT INTO issues (title, description , type , status , reporter_id) 
            VALUES ($1,$2,$3,COALESCE($4,'open'),$5) RETURNING *
        `, [title, description, type, status, user.id]);
    return result.rows[0];
}


const getAllIssuesDB = async (parameter: string) => {

    if (parameter === 'newest') {
        const result = await pool.query(`
        SELECT * FROM issues order by created_at desc 
    `);
        return result.rows;
    }
    else if (parameter === 'oldest') {
        const result = await pool.query(`
        SELECT * FROM issues order by created_at asc 
    `);
        return result.rows;
    }
    else if (parameter == 'bug') {
        const result = await pool.query(`
        SELECT * FROM issues WHERE type=$1
    `, [parameter]);
        return result.rows;
    }
    else if (parameter == 'feature_request') {
        const result = await pool.query(`
        SELECT * FROM issues WHERE type=$1
    `, [parameter]);
        return result.rows;
    }
    else if (parameter == 'open') {
        const result = await pool.query(`
        SELECT * FROM issues WHERE type=$1
    `, [parameter]);
        return result.rows;
    }
    else if (parameter == 'in_progress') {
        const result = await pool.query(`
        SELECT * FROM issues WHERE type=$1
    `, [parameter]);
        return result.rows;
    }
    else if (parameter == 'resolved') {
        const result = await pool.query(`
        SELECT * FROM issues WHERE type=$1
    `, [parameter]);
        return result.rows;
    }

}


const getSingleIssuesDB = async (parameter: string) => {

    const result = await pool.query(`
        SELECT * FROM issues WHERE id=$1
    `, [parameter])

    if (result.rows.length === 0) {
        throw Error("Issue Not Found!");
    }

    return result.rows[0];
}

export const issueService = {
    createIssueIntoDB: createIssueIntoDB,
    getAllIssuesDB: getAllIssuesDB,
    getSingleIssuesDB: getSingleIssuesDB
}
