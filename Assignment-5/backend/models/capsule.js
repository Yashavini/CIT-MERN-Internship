const mongoose = require('mongoose');

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

module.exports = mongoose.model('Capsule', CapsuleSchema);
