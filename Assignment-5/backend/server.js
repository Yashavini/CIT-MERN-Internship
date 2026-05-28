require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database Hook
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected safely to MongoDB Matrix'))
    .catch(err => console.error('❌ Database Link Intercepted:', err));

// --- API ROUTES ---

// Registration Route
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'All authentication fields required.' });
        }

        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: 'Identification matrix already active.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ success: true, message: 'User matrix initialized!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login Route (Generates JWT)
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid identity records.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect authentication cipher.' });
        }

        const token = jwt.sign(
            { id: user._id, username: user.username }, 
            process.env.JWT_SECRET, 
            { expiresIn: '2h' }
        );

        res.status(200).json({ success: true, token, username: user.username });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Protected Database Fetch Route
app.get('/api/vault/data', async (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'Access Denied. Cipher missing.' });

    try {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET);
        
        // Mock data streams mapping out of database collections
        const securePayloads = [
            { id: 1, title: "Project Alpha Cryptographic Keys", classification: "Level-5 Secret" },
            { id: 2, title: "MERN Stack Integration Blueprint", classification: "Core Curriculum" },
            { id: 3, title: "Vibe Coding Deployment Matrix", classification: "Research Phase" }
        ];

        res.status(200).json({ success: true, vaultItems: securePayloads });
    } catch (err) {
        res.status(403).json({ message: 'Token mutation detected or session expired.' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 System Online: Processing on port ${PORT}`));
