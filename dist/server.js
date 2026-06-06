

   import { createRequire } from 'module';

   const require = createRequire(import.meta.url);

  

// src/app.ts
import express from "express";
import CookieParser from "cookie-parser";
import cors from "cors";

// src/modules/auth/auth.route.ts
import { Router } from "express";

// src/modules/auth/auth.service.ts
import bcrypt from "bcryptjs";

// src/db/index.ts
import { Pool } from "pg";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  connection_string: process.env.CONNECTION_STRING,
  port: process.env.PORT,
  secret: process.env.JWT_SECRET,
  refresh_secret: process.env.REFRESH_SECRET
};
var config_default = config;

// src/db/index.ts
var pool = new Pool({
  connectionString: config_default.connection_string,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 1e4,
  idleTimeoutMillis: 1e4
});
var initDB = async () => {
  try {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(64) NOT NULL,
                email VARCHAR(64) UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role VARCHAR(64) NOT NULL DEFAULT 'contributor',
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            );
        `);
    await pool.query(`
            CREATE TABLE IF NOT EXISTS issues (
                id SERIAL PRIMARY KEY,
                title VARCHAR(128) NOT NULL,
                description TEXT NOT NULL,
                type VARCHAR(64) NOT NULL DEFAULT 'bug',
                status  VARCHAR(64) NOT NULL DEFAULT 'open',
                reporter_id INT REFERENCES users(id) ON DELETE CASCADE ,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `);
  } catch (error) {
    console.log("Database error:", error);
  }
};

// src/modules/auth/auth.service.ts
import jwt from "jsonwebtoken";
var createUserIntoDB = async ({ name, email, password, role }) => {
  const hashPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(`
        INSERT INTO users (name , email , password , role) 
        VALUES ($1,$2,$3,COALESCE($4,'contributor'))
        RETURNING *
    `, [name, email, hashPassword, role]);
  delete result.rows[0].password;
  return result;
};
var loginUserDB = async ({ email, password }) => {
  const userData = await pool.query(`
        SELECT * FROM users WHERE email=$1
    `, [email]);
  if (userData.rows.length === 0) throw Error("Something Went Wrong");
  const user = userData.rows[0];
  const matchePassword = await bcrypt.compare(password, user.password);
  if (matchePassword === false) throw Error("Something Went Wrong");
  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  const expireDate = {
    expiresIn: "1d"
  };
  const token = jwt.sign(jwtPayload, config_default.secret, expireDate);
  delete user.password;
  return { token, user };
};
var authService = {
  createUserIntoDB,
  loginUserDB
};

// src/modules/auth/auth.controller.ts
var createUser = async (req, res) => {
  try {
    const result = await authService.createUserIntoDB(req.body);
    return res.status(201).json({
      "success": true,
      "message": "User registered successfully",
      "data": result.rows[0]
    });
  } catch (error) {
    return res.status(500).json({
      "success": false,
      "message": error.message,
      "data": error
    });
  }
};
var loginUser = async (req, res) => {
  try {
    const result = await authService.loginUserDB(req.body);
    return res.status(200).json({
      "success": true,
      "message": "Login successful",
      "data": result
    });
  } catch (error) {
    return res.status(500).json({
      "success": false,
      "message": error.message,
      "data": error
    });
  }
};
var authController = {
  createUser,
  loginUser
};

// src/modules/auth/auth.route.ts
var router = Router();
router.post("/signup", authController.createUser);
router.post("/login", authController.loginUser);
var authRoute = router;

// src/modules/issues/issues.route.ts
import { Router as Router2 } from "express";

// src/modules/issues/issues.service.ts
var createIssueIntoDB = async (payload, user) => {
  const { title, description, type, status } = payload;
  const result = await pool.query(`
            INSERT INTO issues (title, description , type , status , reporter_id) 
            VALUES ($1,$2,$3,COALESCE($4,'open'),$5) RETURNING *
        `, [title, description, type, status, user.id]);
  return result.rows[0];
};
var getAllIssuesDB = async (parameter) => {
  if (parameter === "newest") {
    const result = await pool.query(`
        SELECT * FROM issues order by created_at desc 
    `);
    return result.rows;
  } else if (parameter === "oldest") {
    const result = await pool.query(`
        SELECT * FROM issues order by created_at asc 
    `);
    return result.rows;
  } else if (parameter == "bug") {
    const result = await pool.query(`
        SELECT * FROM issues WHERE type=$1
    `, [parameter]);
    return result.rows;
  } else if (parameter == "feature_request") {
    const result = await pool.query(`
        SELECT * FROM issues WHERE type=$1
    `, [parameter]);
    return result.rows;
  } else if (parameter == "open") {
    const result = await pool.query(`
        SELECT * FROM issues WHERE type=$1
    `, [parameter]);
    return result.rows;
  } else if (parameter == "in_progress") {
    const result = await pool.query(`
        SELECT * FROM issues WHERE status=$1
    `, [parameter]);
    return result.rows;
  } else if (parameter == "resolved") {
    const result = await pool.query(`
        SELECT * FROM issues WHERE status=$1
    `, [parameter]);
    return result.rows;
  }
};
var getSingleIssuesDB = async (parameter) => {
  const result = await pool.query(`
        SELECT * FROM issues WHERE id=$1
    `, [parameter]);
  if (result.rows.length === 0) {
    throw Error("Issue Not Found!");
  }
  return result.rows[0];
};
var updateSingleIssuesDB = async (parameter, payload) => {
  const { title, description, type, status } = payload;
  const result = await pool.query(`
        SELECT * FROM issues WHERE id=$1
    `, [parameter]);
  if (result.rows[0].length === 0) {
    throw Error("Issue Not Exists!");
  }
  return await pool.query(`
                UPDATE issues 
                SET 
                    title = COALESCE($1, title),
                    description = COALESCE($2, description),
                    type = COALESCE($3, type),
                    status = COALESCE($4, status)
                WHERE id = $5
                RETURNING *
            `, [title, description, type, status, result.rows[0].id]);
};
var deleteSingleIssuesDB = async (parameter) => {
  const result = await pool.query(`
        SELECT * FROM issues WHERE id=$1
    `, [parameter]);
  if (result.rows.length === 0) {
    throw Error("Issue Not Found!");
  }
  return await pool.query(`
            DELETE FROM issues WHERE id=$1 RETURNING *
        `, [parameter]);
};
var issueService = {
  createIssueIntoDB,
  getAllIssuesDB,
  getSingleIssuesDB,
  deleteSingleIssuesDB,
  updateSingleIssuesDB
};

// src/modules/issues/issues.controller.ts
var createIssues = async (req, res) => {
  try {
    const result = await issueService.createIssueIntoDB(req.body, req.user);
    return res.status(200).json({
      "success": true,
      "message": "Issue created successfully",
      "data": result
    });
  } catch (error) {
    return res.status(500).json({
      "success": false,
      "message": error.message,
      "data": error
    });
  }
};
var getIssues = async (req, res) => {
  try {
    const query = req.query.sort || req.query.type || req.query.status || "newest";
    const result = await issueService.getAllIssuesDB(query);
    return res.status(200).json({
      "success": true,
      "message": "Issues retrived successfully",
      "data": result
    });
  } catch (error) {
    return res.status(500).json({
      "success": false,
      "message": error.message,
      "data": error
    });
  }
};
var getSingleIssues = async (req, res) => {
  try {
    const params = req.params.id;
    const result = await issueService.getSingleIssuesDB(params);
    return res.status(200).json({
      "success": true,
      "message": "Issue retrived successfully",
      "data": result
    });
  } catch (error) {
    return res.status(500).json({
      "success": false,
      "message": error.message,
      "data": error
    });
  }
};
var updateSingleIssues = async (req, res) => {
  try {
    const params = req.params.id;
    const userData = req.user;
    if (userData?.role !== "maintainer") {
      const issue = await pool.query(`
                SELECT * from issues where id=$1
            `, [params]);
      const tissue = issue.rows[0];
      if (tissue.length == 0) {
        throw Error("Issue Not Found");
      }
      if (tissue.status !== "open") {
        throw Error("Issue Is Not Open!");
      }
      if (tissue.reporter_id != userData?.id) {
        throw Error("This Is Not Your Issue!");
      }
      const { title, description, type } = req.body;
      const result2 = await issueService.updateSingleIssuesDB(params, { title, description, type });
      return res.status(200).json({
        "success": true,
        "message": "Issue updated successfully",
        "data": result2.rows[0]
      });
    }
    const result = await issueService.updateSingleIssuesDB(params, req.body);
    return res.status(200).json({
      "success": true,
      "message": "Issue updated successfully",
      "data": result.rows[0]
    });
  } catch (error) {
    return res.status(500).json({
      "success": false,
      "message": error.message,
      "data": error
    });
  }
};
var deleteSingleIssues = async (req, res) => {
  try {
    const params = req.params.id;
    const userData = req.user;
    if (userData?.role !== "maintainer") {
      throw Error("Role Must Be Maintainer");
    }
    const result = await issueService.deleteSingleIssuesDB(params);
    return res.status(200).json({
      "success": true,
      "message": "Issue deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      "success": false,
      "message": error.message,
      "data": error
    });
  }
};
var issuesController = {
  createIssues,
  getIssues,
  getSingleIssues,
  updateSingleIssues,
  deleteSingleIssues
};

// src/types/index.ts
var USER_ROLES = {
  contributor: "contributor",
  maintainer: "maintainer"
};

// src/middleware/auth.ts
import jwt2 from "jsonwebtoken";
var auth = (...roles) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return res.status(401).json({
          "success": false,
          "message": "Unauthorized access!"
        });
      }
      const decoded = jwt2.verify(token, config_default.secret);
      const userData = await pool.query(`
                SELECT * FROM users WHERE email=$1
            `, [decoded.email]);
      if (userData.rows.length == 0) {
        return res.status(401).json({
          "success": false,
          "message": "Unauthorized access!"
        });
      }
      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
};
var auth_default = auth;

// src/modules/issues/issues.route.ts
var router2 = Router2();
router2.post("/issues", auth_default(USER_ROLES.maintainer, USER_ROLES.contributor), issuesController.createIssues);
router2.get("/issues", issuesController.getIssues);
router2.get("/issues/:id", issuesController.getSingleIssues);
router2.put("/issues/:id", auth_default(USER_ROLES.maintainer, USER_ROLES.contributor), issuesController.updateSingleIssues);
router2.delete("/issues/:id", auth_default(USER_ROLES.maintainer), issuesController.deleteSingleIssues);
var issuesRoute = router2;

// src/app.ts
var app = express();
app.use(CookieParser());
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({
  extended: true
}));
app.use(cors({
  origin: "http://localhost:8080"
}));
app.get("/", (req, res) => {
  return res.status(200).json({
    message: "Express Server",
    author: "Next Level"
  });
});
app.use("/api/auth", authRoute);
app.use("/api", issuesRoute);
var app_default = app;

// src/server.ts
var main = () => {
  initDB();
  app_default.listen(config_default.port, () => {
    console.log(`Server running on : http://localhost:${config_default.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map