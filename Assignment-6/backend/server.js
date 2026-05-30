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
// DATABASE CONNECTION
// ==========================================
mongoose
  .connect(MONGO_URI, {
    dbName: 'echomind_db',
    bufferCommands: false,
  })
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
  });

// ==========================================
// ROOT ROUTE
// ==========================================
app.get('/', (req, res) => {
  res.send('🚀 EchoMind Backend Server Running Successfully');
});

// ==========================================
// MONGOOSE SCHEMAS & MODELS
// ==========================================
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

const CapsuleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      default: null,
    },
    imageLocalUrl: {
      type: String,
      default: null,
    },
    date: {
      type: String,
      required: true,
    },
    history: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

const Capsule = mongoose.models.Capsule || mongoose.model('Capsule', CapsuleSchema);

// ==========================================
// JWT AUTH MIDDLEWARE
// ==========================================
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({
      message: 'Authorization token missing',
    });
  }

  try {
    const token = authHeader.split(' ')[1];

    req.user = jwt.verify(token, JWT_SECRET);

    next();
  } catch (err) {
    res.status(403).json({
      message: 'Invalid or expired token',
    });
  }
};

// ==========================================
// AUTH ROUTES
// ==========================================

// REGISTER
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: 'Please fill all fields',
      });
    }

    const exists = await User.findOne({
      username: username.toLowerCase(),
    });

    if (exists) {
      return res.status(400).json({
        message: 'User already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'Registration successful',
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// LOGIN
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({
      username: username.toLowerCase(),
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({
        message: 'Invalid username or password',
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
      },
      JWT_SECRET,
      {
        expiresIn: '24h',
      }
    );

    res.status(200).json({
      success: true,
      token,
      username: user.username,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// ==========================================
// CAPSULE ROUTES
// ==========================================

// GET ALL CAPSULES
app.get('/api/capsules', verifyToken, async (req, res) => {
  try {
    const data = await Capsule.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// CREATE CAPSULE
app.post('/api/capsules', verifyToken, async (req, res) => {
  try {
    const { title, description, isPrivate, password, imageLocalUrl } = req.body;

    const newCapsule = new Capsule({
      userId: req.user.id,
      title,
      description,
      isPrivate,
      password: isPrivate ? password : null,
      imageLocalUrl,
      date: new Date().toLocaleDateString(),
      history: [`Memory created on ${new Date().toLocaleDateString()}`],
    });

    await newCapsule.save();

    res.status(201).json({
      success: true,
      data: newCapsule,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// UPDATE CAPSULE
app.put('/api/capsules/:id', verifyToken, async (req, res) => {
  try {
    const { title, description, history } = req.body;

    const updated = await Capsule.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id,
      },
      {
        title,
        description,
        history,
      },
      {
        new: true,
      }
    );

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// DELETE CAPSULE
app.delete('/api/capsules/:id', verifyToken, async (req, res) => {
  try {
    await Capsule.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    res.status(200).json({
      success: true,
      message: 'Memory deleted successfully',
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

app.get('/test-db', (req, res) => {
    res.json({
        readyState: mongoose.connection.readyState
    });
});
// ==========================================
// SERVER
// ==========================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

app.get('/mongo-debug', (req, res) => {
  res.json({
    readyState: mongoose.connection.readyState,
    uriStart: process.env.MONGO_URI?.substring(0, 60)
  });
});
