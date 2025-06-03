import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import Game from '../src/models/Game.js';

const genres = ['Action', 'Adventure', 'RPG', 'FPS', 'Simulation', 'Strategy', 'Puzzle', 'Platform', 'Racing', 'Sports'];
const platforms = ['PC', 'PS5', 'Xbox Series', 'Switch', 'Mobile', 'Arcade'];
const devs = ['Nintendo', 'Sony', 'Microsoft', 'Capcom', 'Ubisoft', 'Rockstar', 'EA', 'Square Enix', 'Valve', 'Bethesda'];

const games = [];
for (let i = 1; i <= 100; i++) {
    games.push({
        title: `Legendary Game #${i}`,
        platform: [platforms[Math.floor(Math.random() * platforms.length)]],
        releaseYear: Math.floor(Math.random() * 40) + 1985,
        genre: genres[Math.floor(Math.random() * genres.length)],
        developer: devs[Math.floor(Math.random() * devs.length)],
        metascore: Math.floor(Math.random() * 50) + 50
    });
}

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        await Game.deleteMany({});
        await Game.insertMany(games);
        console.log('Database seeded!');
        mongoose.disconnect();
    });
