const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const helmet = require("helmet");
require('dotenv').config();

const app = express();

// CORS Setup to allow requests from any frontend origin (any port)
app.use(cors({
    origin: '*', // Allows requests from any origin
    credentials: true
}));

// Security headers
app.use(helmet());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// MySQL connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Middleware to authenticate JWT token
async function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Access Denied: No Token Provided" });

    try {
        const user = jwt.verify(token, JWT_SECRET);
        req.user = user;
        next();
    } catch (err) {
        res.status(403).json({ error: "Invalid Token" });
    }
}

// Function to log user actions
async function logAction(userId, action) {
    try {
        const sql = "INSERT INTO activity_logs (user_id, action) VALUES (?, ?)";
        await pool.execute(sql, [userId, action]);
    } catch (err) {
        console.error("Error logging action:", err.message);
    }
}

// Signup route
app.post("/SignUp", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: "Please fill in all fields" });
    }

    try {
        const checkEmailQuery = "SELECT * FROM users WHERE email = ?";
        const [results] = await pool.execute(checkEmailQuery, [email]);

        if (results.length > 0) {
            return res.status(409).json({ error: "Email already exists." });
        }

        const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
        await pool.execute(sql, [name, email, password]);  // Store plain password

        await logAction(null, "Registered a new user: " + name);
        res.status(201).json({ message: "User Registered Successfully" });
    } catch (err) {
        console.error("Error registering user:", err.message);
        res.status(500).json({ error: "Error registering user" });
    }
});

// Signin route
app.post("/SignIn", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Please fill in all fields" });
    }

    try {
        const sql = "SELECT * FROM users WHERE email = ?";
        const [data] = await pool.execute(sql, [email]);

        if (data.length === 0 || data[0].password !== password) {  // Compare plain password
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const user = data[0];
        const token = jwt.sign({ id: user.id, name: user.name }, JWT_SECRET, { expiresIn: '1h' });
        await logAction(user.id, "Signed in");
        res.json({ message: "Success", token });
    } catch (err) {
        console.error("Error during signin:", err.message);
        res.status(500).json({ error: "Error during signin" });
    }
});

// Get User Profile route
app.get("/users/profile", authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {
        const sql = "SELECT id, name, email FROM users WHERE id = ?";
        const [data] = await pool.execute(sql, [userId]);

        if (data.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ user: data[0] });
    } catch (err) {
        console.error("Error fetching user profile:", err.message);
        res.status(500).json({ error: "Error fetching user profile" });
    }
});

// Health check route
app.get("/", (req, res) => {
    res.send("Server is running");
});

// Start the server
const PORT = process.env.PORT || 8087;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
