// index.js
const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// MySQL Database Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err.stack);
        return;
    }
    console.log("Connected to MySQL database.");
});

// Route: User Signup
app.post("/SignUp", (req, res) => {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
        return res.status(400).json({ error: "Please fill in all fields" });
    }

    // Check if email already exists
    const checkEmailQuery = "SELECT * FROM users WHERE email = ?";
    db.query(checkEmailQuery, [email], (err, results) => {
        if (err) {
            console.error("Error checking email:", err.message);
            return res.status(500).json({ error: "Error checking email in database" });
        }
        if (results.length > 0) {
            return res.status(409).json({ error: "Email already exists." });
        }

        // Insert new user
        const insertUserQuery = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
        db.query(insertUserQuery, [name, email, password], (err) => {
            if (err) {
                console.error("Error inserting user:", err.message);
                return res.status(500).json({ error: "Error inserting user in database" });
            }
            res.status(201).json({ message: "User Registered Successfully" });
        });
    });
});

// Root endpoint
app.get("/", (req, res) => {
    res.send("Welcome to the Secure Login System API");
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
