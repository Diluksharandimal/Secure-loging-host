const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
require('dotenv').config();

const app = express();
app.use(cors({
    origin: '*', // Allow requests from any origin
}));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Create MySQL connection pool
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection
db.getConnection((err, connection) => {
    if (err) {
        console.error("Database connection failed:", err.message);
    } else {
        console.log("Database connected successfully");
        connection.release(); // release the connection back to the pool
    }
});

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Function to insert admin into the database without hashing password
async function createAdmin(email, password) {
    try {
        // SQL query to insert admin with plaintext password
        const sql = "INSERT INTO admins (email, password) VALUES (?, ?)";

        return new Promise((resolve, reject) => {
            db.query(sql, [email, password], (err, result) => {
                if (err) {
                    console.error("Error inserting admin:", err);
                    reject(err);
                } else {
                    console.log("Admin created successfully:", result);
                    resolve(result);
                }
            });
        });
    } catch (error) {
        console.error("Error during admin creation:", error);
        throw error;
    }
}

// Middleware for authenticating JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json("Access Denied: No Token Provided");

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error("Token verification failed:", err);
            return res.status(403).json("Invalid Token");
        }
        req.user = user;
        next();
    });
}

// Log action to the activity_logs table
function logAction(userId, action) {
    const sql = "INSERT INTO activity_logs (user_id, action) VALUES (?, ?)";
    db.query(sql, [userId, action], (err) => {
        if (err) console.error("Error logging action:", err);
    });
}

// Sign-up route for new users without password hashing
app.post("/signup", (req, res) => {
    const { name, email, password } = req.body;
    const checkUserSql = "SELECT * FROM users WHERE email = ?";
    const insertUserSql = "INSERT INTO users (name, email, password) VALUES (?)";

    // Check if the user already exists
    db.query(checkUserSql, [email], (err, data) => {
        if (err) return res.status(500).json("Error checking user");

        if (data.length > 0) {
            return res.status(400).json("User already exists");
        }

        const values = [name, email, password];

        // Insert user into the database without hashing password
        db.query(insertUserSql, [values], (err) => {
            if (err) {
                return res.status(500).json("Error registering user");
            }
            res.json("User Registered Successfully");
        });
    });
});

// Sign-in route for authentication without password hashing
app.post("/signin", (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email], (err, data) => {
        if (err) {
            return res.status(500).json("Error");
        }
        if (data.length > 0) {
            const user = data[0];

            // Compare plaintext password directly with the stored password
            if (password !== user.password) {
                return res.status(401).json("Invalid Credentials");
            }

            // Generate JWT token
            const token = jwt.sign({ id: user.id, name: user.name }, JWT_SECRET, { expiresIn: '1h' });

            logAction(user.id, "Signed in");

            res.json({ message: "Success", token });
        } else {
            return res.status(401).json("User not found");
        }
    });
});

// Admin login route
app.post("/admin-login", (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM admins WHERE email = ?";

    db.query(sql, [email], (err, data) => {
        if (err) {
            return res.status(500).json("Error");
        }
        if (data.length > 0) {
            const admin = data[0];

            // Compare plaintext password directly with the stored password
            if (password !== admin.password) {
                return res.status(401).json("Invalid Credentials");
            }

            // Generate JWT token
            const token = jwt.sign({ id: admin.id, email: admin.email }, JWT_SECRET, { expiresIn: '1h' });

            logAction(admin.id, "Admin logged in");

            res.json({ message: "Admin login successful", token });
        } else {
            return res.status(401).json("Admin not found");
        }
    });
});

// Protected route to fetch user data
app.get("/users", authenticateToken, (req, res) => {
    const sql = "SELECT * FROM users WHERE id = ?";

    db.query(sql, [req.user.id], (err, data) => {
        if (err) {
            return res.status(500).json("Error fetching data");
        }

        logAction(req.user.id, "Viewed own data");

        if (data.length > 0) {
            return res.json(data[0]);
        } else {
            return res.status(404).json("User not found");
        }
    });
});

// Protected admin route
app.get("/admin-home", authenticateToken, (req, res) => {
    // Check if the user is an admin
    if (req.user && req.user.email) {
        const sql = "SELECT * FROM admins WHERE email = ?";
        db.query(sql, [req.user.email], (err, data) => {
            if (err) {
                return res.status(500).json("Error");
            }
            if (data.length > 0) {
                res.json({ message: "Welcome to Admin Home", admin: data[0] });
            } else {
                return res.status(403).json("Access Denied: You are not an admin");
            }
        });
    } else {
        return res.status(403).json("Access Denied: Invalid Token");
    }
});

// Create admin route (no hashing)
app.post("/create-admin", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Call createAdmin function to insert admin with plaintext password
        await createAdmin(email, password);
        res.status(201).json({ message: "Admin created successfully" });
    } catch (err) {
        res.status(500).json({ error: "Error creating admin" });
    }
});

// Start the server on Vercel port
app.listen(process.env.PORT || 8087, () => {
    console.log("Server is running on port 8087");
});
