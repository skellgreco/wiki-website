const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // For token generation
const cors = require('cors'); 

const app = express();
const PORT = 80;

app.use(cors()); 
app.use(bodyParser.json());
app.use(express.static('public'));

const ANNOUNCEMENTS_FILE = path.join(__dirname, 'announcements.json');

// Load environment variables from .env file
require('dotenv').config();
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH; // Retrieve hashed password from environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Secret for JWT signing

// Load announcements from file
function loadAnnouncements() {
    try {
        return JSON.parse(fs.readFileSync(ANNOUNCEMENTS_FILE, 'utf-8'));
    } catch (error) {
        console.error('Error loading announcements:', error);
        return { pinned: [], important: [], tutorials: [], updates: [], other: [] };
    }
}

// Save announcements to file
function saveAnnouncements(announcements) {
    try {
        fs.writeFileSync(ANNOUNCEMENTS_FILE, JSON.stringify(announcements, null, 2));
    } catch (error) {
        console.error('Error saving announcements:', error);
    }
}

// Serve announcements.json
app.get('/announcements.json', (req, res) => {
    try {
        const data = fs.readFileSync(ANNOUNCEMENTS_FILE, 'utf-8');
        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    } catch (error) {
        console.error('Error reading announcements.json:', error);
        res.status(500).send('Failed to load announcements.');
    }
});

// Authenticate user
app.post('/authenticate', async (req, res) => {
    const { password } = req.body;

    if (await bcrypt.compare(password, ADMIN_PASSWORD_HASH)) {
        const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '1h' }); // Create a token
        res.json({ success: true, token });
    } else {
        res.status(403).json({ success: false, message: 'Incorrect password' });
    }
});

// Middleware to verify token
function verifyToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1]; // Get token from header

    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ success: false, message: 'Failed to authenticate token' });
        next();
    });
}

// Post announcement
app.post('/post-announcement', verifyToken, (req, res) => {
    const { title, content, date, category } = req.body;

    console.log(`Received post request: title=${title}, content=${content}, date=${date}, category=${category}`);

    const announcements = loadAnnouncements();
    
    const newAnnouncement = {
        id: uuidv4(), // Generate a unique ID
        title,
        content,
        date
    };
    
    if (category === 'pinned') {
        announcements[category] = [newAnnouncement];
    } else {
        announcements[category].push(newAnnouncement);
    }
    
    saveAnnouncements(announcements);
    res.json({ success: true });
});

// Edit announcement
app.post('/edit-announcement', verifyToken, (req, res) => {
    const { id, title, content, date, category } = req.body;

    console.log(`Received edit request: id=${id}, title=${title}, content=${content}, date=${date}, category=${category}`);

    const announcements = loadAnnouncements();
    
    const announcementIndex = announcements[category].findIndex(ann => ann.id === id);
    
    if (announcementIndex !== -1) {
        announcements[category][announcementIndex] = { id, title, content, date };
        saveAnnouncements(announcements);
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false, message: 'Announcement not found' });
    }
});

// Delete announcement
app.post('/delete-announcement', verifyToken, (req, res) => {
    const { category, id } = req.body;

    console.log(`Received delete request: category=${category}, id=${id}`);

    const announcements = loadAnnouncements();

    const index = announcements[category].findIndex(ann => ann.id === id);
    
    if (index !== -1) {
        announcements[category].splice(index, 1);
        saveAnnouncements(announcements);
        res.json({ success: true });
    } else {
        res.status(404).json({ success: false, message: 'Announcement not found' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
