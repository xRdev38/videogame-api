const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
    title: String,
    platform: [String],
    releaseYear: Number,
    genre: String,
    developer: String,
    metascore: Number
});

module.exports = mongoose.model('Game', GameSchema);
