require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const session = require('express-session');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdn.tailwindcss.com", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
            fontSrc: ["'self'", "data:", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https://via.placeholder.com", "blob:"],
            connectSrc: ["'self'", "https://fonts.googleapis.com", "https://fonts.gstatic.com"],
            frameSrc: ["'self'"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: []
        }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 // 1 hour
    }
}));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// File Upload Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Error: Images Only!'));
    }
});

// Database Setup
const db = new sqlite3.Database('database.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize Database Tables
function initializeDatabase() {
    db.serialize(() => {
        // Gallery Table
        db.run(`CREATE TABLE IF NOT EXISTS gallery (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            image_path TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Activities Table
        db.run(`CREATE TABLE IF NOT EXISTS activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Honeypot Logs Table
        db.run(`CREATE TABLE IF NOT EXISTS honeypot_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ip_address TEXT,
            user_agent TEXT,
            attempted_username TEXT,
            attempted_password TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    });
}

// Email Configuration for Honeypot Alerts
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Route handlers for clean URLs
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/about.html'));
});

app.get('/services', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/services.html'));
});

app.get('/activities', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/activities.html'));
});

app.get('/gallery', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/gallery.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/contact.html'));
});

app.get('/governing-body', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/governing-body.html'));
});

app.get('/your-rights', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/your-rights.html'));
});

app.get('/indian-laws', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/indian-laws.html'));
});

app.get('/grievance', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/grievance.html'));
});

// Admin routes
app.get('/admin', (req, res) => {
    res.redirect('/admin/secure/login');
});

app.get('/admin/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/admin/secure/login.html'));
});

app.get('/admin/dashboard', (req, res) => {
    if (!req.session.adminAuthenticated) {
        return res.redirect('/admin/login');
    }
    res.sendFile(path.join(__dirname, 'public/admin/secure/dashboard.html'));
});

// Honeypot admin routes
app.get('/admin/panel', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/admin/honeypot/login.html'));
});

// Honeypot Admin Login Route
app.post('/api/honeypot-login', async (req, res) => {
    const { username, password } = req.body;
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];

    // Log the attempt
    db.run(`INSERT INTO honeypot_logs (ip_address, user_agent, attempted_username, attempted_password)
            VALUES (?, ?, ?, ?)`,
        [ip, userAgent, username, password]);

    // Send email alert
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL,
            subject: 'Honeypot Login Attempt Detected',
            html: `
                <h2>Honeypot Login Attempt Details:</h2>
                <p><strong>IP Address:</strong> ${ip}</p>
                <p><strong>User Agent:</strong> ${userAgent}</p>
                <p><strong>Attempted Username:</strong> ${username}</p>
                <p><strong>Attempted Password:</strong> ${password}</p>
                <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            `
        });
    } catch (error) {
        console.error('Error sending email alert:', error);
    }

    // Delay response to simulate processing
    setTimeout(() => {
        res.status(401).json({ error: 'Invalid credentials' });
    }, 2000);
});

// Secure Admin Routes
const adminRouter = express.Router();

// Admin Authentication Middleware
adminRouter.use((req, res, next) => {
    if (!req.session.adminAuthenticated) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
});

// Gallery Management Routes
adminRouter.get('/gallery', (req, res) => {
    db.all('SELECT * FROM gallery ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

adminRouter.post('/gallery', upload.single('image'), (req, res) => {
    const { title, description } = req.body;
    const imagePath = req.file.filename;

    db.run(
        'INSERT INTO gallery (title, description, image_path) VALUES (?, ?, ?)',
        [title, description, imagePath],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error saving to database' });
            }
            res.json({ id: this.lastID, title, description, image_path: imagePath });
        }
    );
});

// Activities Management Routes
adminRouter.get('/activities', (req, res) => {
    db.all('SELECT * FROM activities ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

adminRouter.post('/activities', (req, res) => {
    const { title, content } = req.body;
    
    db.run(
        'INSERT INTO activities (title, content) VALUES (?, ?)',
        [title, content],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Error saving to database' });
            }
            res.json({ id: this.lastID, title, content });
        }
    );
});

app.use('/api/admin', adminRouter);

// Middleware to check for direct HTML file access
app.use((req, res, next) => {
    // Skip API routes and static assets
    if (req.path.startsWith('/api/') || 
        req.path.startsWith('/css/') || 
        req.path.startsWith('/js/') || 
        req.path.startsWith('/images/')) {
        return next();
    }

    // Handle direct HTML file access
    if (req.path.endsWith('.html')) {
        const cleanPath = req.path.slice(0, -5);
        return res.redirect(301, cleanPath || '/');
    }

    // Handle index.html access
    if (req.path === '/index') {
        return res.redirect(301, '/');
    }

    next();
});

// Serve static files for assets
app.use('/css', express.static('public/css'));
app.use('/js', express.static('public/js'));
app.use('/images', express.static('public/images'));
app.use('/uploads', express.static('public/uploads'));

// Serve static files - this should come after route handlers
app.use(express.static('public', {
    extensions: ['html'], // Allow accessing files without extensions
    index: false // Disable automatic serving of index.html
}));

// Handle 404 - Keep this as the last route
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public/404.html'));
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
