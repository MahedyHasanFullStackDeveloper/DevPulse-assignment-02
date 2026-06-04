import express, { type Application, type Request, type Response } from 'express';
// import { userRoute } from './modules/user/user.route';
// import { profileRoute } from './modules/profile/profile.route';
// import { authRoute } from './modules/auth/auth.route';
import CookieParser from "cookie-parser";
import cors from 'cors';
import { authRoute } from './modules/auth/auth.route';
import { issuesRoute } from './modules/issues/issues.route';
// import globalErrorHandler from './middleware/globalErrorHandler';


const app: Application = express()

app.use(CookieParser());
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({
    extended: true
}));
app.use(cors({
    origin: "http://localhost:8080"
}));

app.get('/', (req: Request, res: Response) => {
    return res.status(200).json({
        message: 'Express Server',
        author: 'Next Level'
    });
});


app.use('/api/auth', authRoute);
app.use('/api', issuesRoute);


export default app; 