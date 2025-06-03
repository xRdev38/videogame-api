import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import algoliasearch from 'algoliasearch';
import Game from '../src/models/Game.js';

const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID;
const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY;

const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);
const index = client.initIndex('videogames');

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        const games = await Game.find({});
        const formattedGames = games.map(game => ({
            objectID: game._id.toString(),
            ...game.toObject()
        }));
        await index.saveObjects(formattedGames);
        console.log('Synced to Algolia!');
        mongoose.disconnect();
    });
