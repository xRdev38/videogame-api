const mongoose = require('mongoose');
const algoliasearch = require('algoliasearch');
const Game = require('../src/models/Game');

const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID || 'YourAlgoliaAppID';
const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY || 'YourAlgoliaAdminAPIKey';

const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);
const index = client.initIndex('videogames');

mongoose.connect('mongodb://localhost:27017/videogames', { useNewUrlParser: true, useUnifiedTopology: true })
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
