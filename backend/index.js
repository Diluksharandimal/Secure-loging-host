const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require('dotenv').config();

const app = express();

// CORS Configuration
app.use(cors({
    origin: 'https://secure-loging-host-client.vercel.app', // Replace with your client URL
    credentials: true,
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

// Test database connection
db.getConnection((err, connection) => {
    if (err) {
        console.error("Database connection failed:", err.message);
    } else {
        console.log("Database connected successfully");
        connection.release();
    }
});

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Function to insert admin into the database
async function createAdmin(email, plainPassword) {
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    const sql = "INSERT INTO admins (email, password) VALUES (?, ?)";

    return new Promise((resolve, reject) => {
        db.query(sql, [email, hashedPassword], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    console.log("Admin already exists");
                    resolve();
                } else {
                    console.error("Error inserting admin:", err);
                    reject(err);
                }
            } else {
                console.log("Admin created successfully:", result);
                resolve(result);
            }
        });
    });
}

// Middleware for authenticating JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Access Denied: No Token Provided" });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error("Token verification failed:", err);
            return res.status(403).json({ error: "Invalid Token" });
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

// Sign-up route for new users
app.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;
    const checkUserSql = "SELECT * FROM users WHERE email = ?";
    const insertUserSql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";

    db.query(checkUserSql, [email], async (err, data) => {
        if (err) return res.status(500).json({ error: "Error checking user" });

        if (data.length > 0) {
            return res.status(400).json({ error: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        db.query(insertUserSql, [name, email, hashedPassword], (err) => {
            if (err) {
                return res.status(500).json({ error: "Error registering user" });
            }
            res.json({ message: "User Registered Successfully" });
        });
    });
});

// Sign-in route for authentication
app.post("/signin", (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email], async (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Error" });
        }
        if (data.length > 0) {
            const user = data[0];

            // Validate password
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({ error: "Invalid Credentials" });
            }

            const token = jwt.sign({ id: user.id, name: user.name }, JWT_SECRET, { expiresIn: '1h' });

            logAction(user.id, "Signed in");

            res.json({ message: "Success", token });
        } else {
            return res.status(401).json({ error: "User not found" });
        }
    });
});

// Automatically create admin user when the server starts
createAdmin("admin@gmail.com", "Admin0011").catch(err => {
    console.error("Error creating admin:", err);
});

app.get("/", (req, res) => {
    res.send("hello world");
});

app.listen(8086, () => {
    console.log("Server is running on port 8086");
});
