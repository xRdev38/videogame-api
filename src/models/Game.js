import mongoose from 'mongoose';

const GameSchema = new mongoose.Schema({
    title: String,
    platform: [String],
    releaseYear: Number,
    genre: String,
    developer: String,
    metascore: Number,
    imageUrl: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Game = mongoose.model('Game', GameSchema);
export default Game;
