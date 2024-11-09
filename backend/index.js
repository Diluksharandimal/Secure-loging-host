const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();

// Middleware setup
app.use(bodyParser.json());
app.use(cors());

// Database connection (ensure your credentials are correct)
const db = mysql.createConnection({
    host: 'localhost', // Update with your database host
    user: 'root',      // Update with your database user
    password: '',      // Update with your database password
    database: 'your_database_name' // Update with your database name
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
    } else {
        console.log('Connected to MySQL database.');
    }
});

// JWT Secret
const JWT_SECRET = 'your_jwt_secret';  // Change to your secret key

// SignUp route
app.post('/SignUp', async (req, res) => {
    const { name, email, password } = req.body;

    console.log('Received data:', req.body); // Log incoming data to verify

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    // Directly use password without hashing (not recommended for production)
    try {
        const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
        db.query(query, [name, email, password], (err, result) => {
            if (err) {
                console.error('Error inserting user into database:', err);
                return res.status(500).json({ message: 'Error registering user.' });
            }

            // Generate JWT token
            const token = jwt.sign({ id: result.insertId, email: email }, JWT_SECRET, {
                expiresIn: '1h',
            });

            // Send response with token
            res.status(201).json({ message: 'User registered successfully!', token });
        });
    } catch (error) {
        console.error('Error processing sign-up:', error);
        res.status(500).json({ message: 'Error processing sign-up.' });
    }
});

// SignIn route
app.post('/SignIn', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
        db.query(query, [email, password], (err, result) => {
            if (err) {
                console.error('Database query error:', err);
                return res.status(500).json({ message: 'Error during sign-in.' });
            }

            if (result.length === 0) {
                return res.status(401).json({ message: 'Invalid credentials.' });
            }

            const user = result[0];

            // Generate JWT token
            const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
                expiresIn: '1h',
            });

            res.status(200).json({ message: 'Sign-in successful!', token });
        });
    } catch (error) {
        console.error('Error during sign-in:', error);
        res.status(500).json({ message: 'Error during sign-in.' });
    }
});

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(403).json({ message: 'Token is required for authentication.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token.' });
        }
        req.user = user;
        next();
    });
};

// Fetch user profile
app.get('/profile', authenticateToken, (req, res) => {
    const userId = req.user.id;

    const query = 'SELECT id, name, email FROM users WHERE id = ?';
    db.query(query, [userId], (err, result) => {
        if (err) {
            console.error('Error fetching user profile:', err);
            return res.status(500).json({ message: 'Error fetching profile.' });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json(result[0]);
    });
});

// Fetch admin name and activity log of users
app.get('/admin/logs', authenticateToken, (req, res) => {
    // Check if the logged-in user is an admin
    if (req.user.email !== 'admin@example.com') {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
    }

    // Query to fetch admin details
    const adminQuery = 'SELECT name FROM users WHERE email = "admin@example.com"';
    db.query(adminQuery, (err, result) => {
        if (err) {
            console.error('Error fetching admin name:', err);
            return res.status(500).json({ message: 'Error fetching admin details.' });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: 'Admin not found.' });
        }

        const adminName = result[0].name;

        // Query to fetch user activity logs
        const logsQuery = 'SELECT * FROM user_activity_logs ORDER BY timestamp DESC';
        db.query(logsQuery, (err, logs) => {
            if (err) {
                console.error('Error fetching user activity logs:', err);
                return res.status(500).json({ message: 'Error fetching logs.' });
            }

            res.status(200).json({ adminName, logs });
        });
    });
});

// Test root route (for verifying server is running)
app.get('/', (req, res) => {
    res.send('Server is running...');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
