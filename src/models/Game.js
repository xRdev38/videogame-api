const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
    title: String,
    platform: [String],
    releaseYear: Number,
    genre: String,
    developer: String,
    metascore: Number,
    imageUrl: String, // Image on Netlify CDN
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Game', GameSchema);