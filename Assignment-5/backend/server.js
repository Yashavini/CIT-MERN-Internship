require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Capsule = require('./models/Capsule');

const app = express();
app.use(express.json({ limit: '15mb' }));
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected safely to MongoDB Matrix'))
    .catch(err => console.error('❌ Database Link Intercepted:', err));

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'Cipher token validation missing.' });
    try {
        const token = authHeader.split(' ')[1];
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (err) { res.status(403).json({ message: 'Session payload invalid.' }); }
};

// Auth Routes
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

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username: username.toLowerCase() });
        if(!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: "Invalid credentials." });
        }
        const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.status(200).json({ success: true, token, username: user.username });
    } catch(err) { res.status(500).json({ error: err.message }); }
});

// Data Controllers
app.get('/api/capsules', verifyToken, async (req, res) => {
    try {
        const data = await Capsule.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data });
    } catch(err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/capsules', verifyToken, async (req, res) => {
    try {
        const { title, description, isPrivate, password, imageLocalUrl, tag } = req.body;
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

app.delete('/api/capsules/:id', verifyToken, async (req, res) => {
    try {
        await Capsule.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        res.status(200).json({ success: true });
    } catch(err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Matrix Server Up on port ${PORT}`));
