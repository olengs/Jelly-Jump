const mongoose = require('mongoose');

const gameHistoryEntrySchema = new mongoose.Schema({
    score: {
        type: Number,
        required: true,
        min: 0
    },
    level: {
        type: Number,
        required: true,
        min: 1
    },
    duration: {
        type: Number, // in seconds
        required: true,
        min: 0
    },
    playedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: true });

const playerSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [20, 'Username cannot exceed 20 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    highScore: {
        type: Number,
        default: 0,
        min: 0
    },
    totalGamesPlayed: {
        type: Number,
        default: 0,
        min: 0
    },
    gameHistory: [gameHistoryEntrySchema],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Player', playerSchema);
