
import { Router } from "express";
import { issuesController } from "./issues.controller";

const router = Router();


router.post('/issues', issuesController.createIssues);
// router.post('/login', authController.loginUser);


export const issuesRoute = router;