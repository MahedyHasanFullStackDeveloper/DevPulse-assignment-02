import type { Iissue } from "./issues.interface";

const createIssueIntoDB = async ({ title, description, type }: Iissue) => {
    console.log({ title, description, type });

    const token = req.headers.authorization;

}

export const issueService = {
    createIssueIntoDB: createIssueIntoDB,
}
