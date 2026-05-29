require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json({ limit: '15mb' }));
app.use(cors());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/echomind_db';
const JWT_SECRET = process.env.JWT_SECRET || 'SUPER_SECRET_COMPLEX_KEY_YASH_2026';

// ==========================================
// 1. DATABASE CONNECTION MATRIX
// ==========================================
mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Connected safely to MongoDB Matrix (echomind_db)'))
    .catch(err => console.error('❌ Database Link Intercepted:', err));

// ==========================================
// 2. MONGOOSE SCHEMAS & MODELS
// ==========================================
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true }
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const CapsuleSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    isPrivate: { type: Boolean, default: false },
    password: { type: String, default: null },
    imageLocalUrl: { type: String, default: null },
    date: { type: String, required: true },
    history: [{ type: String }]
}, { timestamps: true });
const Capsule = mongoose.models.Capsule || mongoose.model('Capsule', CapsuleSchema);

// ==========================================
// 3. SECURITY AUTHENTICATION MIDDLEWARE
// ==========================================
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'Cipher token validation missing.' });
    try {
        const token = authHeader.split(' ')[1];
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (err) { 
        res.status(403).json({ message: 'Session payload invalid.' }); 
    }
};

// ==========================================
// 4. API ROUTE ROUTERS
// ==========================================

// User Registration
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if(!username || !password) return res.status(400).json({ message: "Parameters incomplete." });
        
        const exists = await User.findOne({ username: username.toLowerCase() });
        if(exists) return res.status(400).json({ message: "Identity vector already active." });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ success: true });
    } catch(err) { res.status(500).json({ error: err.message }); }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username: username.toLowerCase() });
        if(!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: "Invalid system credentials." });
        }
        const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
        res.status(200).json({ success: true, token, username: user.username });
    } catch(err) { res.status(500).json({ error: err.message }); }
});

// Fetch User's Capsules
app.get('/api/capsules', verifyToken, async (req, res) => {
    try {
        const data = await Capsule.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data });
    } catch(err) { res.status(500).json({ error: err.message }); }
});

// Create Capsule
app.post('/api/capsules', verifyToken, async (req, res) => {
    try {
        const { title, description, isPrivate, password, imageLocalUrl } = req.body;
        const blueprint = new Capsule({
            userId: req.user.id,
            title,
            description,
            isPrivate,
            password: isPrivate ? password : null,
            imageLocalUrl,
            date: new Date().toLocaleDateString(),
            history: [`Capsule deployed on ${new Date().toLocaleDateString()}`]
        });
        await blueprint.save();
        res.status(201).json({ success: true, data: blueprint });
    } catch(err) { res.status(500).json({ error: err.message }); }
});

// Update Capsule Content
app.put('/api/capsules/:id', verifyToken, async (req, res) => {
    try {
        const { title, description, history } = req.body;
        const updated = await Capsule.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { title, description, history },
            { new: true }
        );
        res.status(200).json({ success: true, data: updated });
    } catch(err) { res.status(500).json({ error: err.message }); }
});

// Delete Capsule
app.delete('/api/capsules/:id', verifyToken, async (req, res) => {
    try {
        await Capsule.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        res.status(200).json({ success: true });
    } catch(err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Matrix Server Up on port ${PORT}`));
