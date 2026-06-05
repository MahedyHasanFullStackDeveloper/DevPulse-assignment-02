
import { Router } from "express";
import { issuesController } from "./issues.controller";
import { USER_ROLES } from "../../types";
import auth from "../../middleware/auth";

const router = Router();


router.post('/issues', auth(USER_ROLES.maintainer, USER_ROLES.contributor), issuesController.createIssues);
router.get('/issues', issuesController.getIssues);
router.get('/issues/:id', issuesController.getSingleIssues);
// router.post('/login', authController.loginUser);
// router.post('/issues', auth(USER_ROLES.maintainer), issuesController.createIssues);


export const issuesRoute = router;