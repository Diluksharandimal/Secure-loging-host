const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const helmet = require("helmet");
require('dotenv').config();

const app = express();

// CORS Setup to allow frontend requests
app.use(cors({
    origin: 'https://secure-loging-system-client.vercel.app',
    credentials: true
}));

// Security headers for added protection
app.use(helmet());

// Middleware to parse JSON data
app.use(express.json());

// MySQL connection setup with a pool for better handling in a serverless environment
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// JWT Secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Access Denied: No Token Provided" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid Token" });
        req.user = user;
        next();
    });
}

// Function to log user actions
function logAction(userId, action) {
    const sql = "INSERT INTO activity_logs (user_id, action) VALUES (?, ?)";
    db.query(sql, [userId, action], (err) => {
        if (err) {
            console.error("Error logging action:", err.message);
        }
    });
}

// Signup route
app.post("/SignUp", (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: "Please fill in all fields" });
    }

    const checkEmailQuery = "SELECT * FROM users WHERE email = ?";
    db.query(checkEmailQuery, [email], (err, results) => {
        if (err) {
            console.error("Error checking email:", err.message);
            return res.status(500).json({ error: "Error checking email" });
        }
        if (results.length > 0) {
            return res.status(409).json({ error: "Email already exists." });
        }

        const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
        db.query(sql, [name, email, password], (err) => {
            if (err) {
                console.error("Error registering user:", err.message);
                return res.status(500).json({ error: "Error registering user" });
            }

            logAction(null, "Registered a new user: " + name);
            res.status(201).json({ message: "User Registered Successfully" });
        });
    });
});

// Signin route
app.post("/SignIn", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Please fill in all fields" });
    }

    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], (err, data) => {
        if (err) {
            console.error("Error during signin:", err.message);
            return res.status(500).json({ error: "Error during signin" });
        }
        if (data.length === 0 || data[0].password !== password) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const user = data[0];
        const token = jwt.sign({ id: user.id, name: user.name }, JWT_SECRET, { expiresIn: '1h' });
        logAction(user.id, "Signed in");
        res.json({ message: "Success", token });
    });
});

// Get User Profile route
app.get("/users/profile", authenticateToken, (req, res) => {
    const userId = req.user.id;

    const sql = "SELECT id, name, email FROM users WHERE id = ?";
    db.query(sql, [userId], (err, data) => {
        if (err) {
            console.error("Error fetching user profile:", err.message);
            return res.status(500).json({ error: "Error fetching user profile" });
        }
        if (data.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({ user: data[0] });
    });
});

app.get("/", (req, res) => {
    res.send("Server is running");
});

// Start the server (for local testing only)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 8087;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;
