import dotenv from 'dotenv';
dotenv.config();

import Game from '../models/Game.js';
import algoliasearch from 'algoliasearch';
import sharp from 'sharp';
import * as netlifyBlobs from '@netlify/blobs';

const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID;
const ALGOLIA_SEARCH_KEY = process.env.ALGOLIA_SEARCH_KEY;
const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY);
const index = client.initIndex('videogames');

export const getGames = async (req, res) => {
    const { page = 1, limit = 10, genre, platform, developer, minScore, maxScore, q } = req.query;
    let filter = {};
    if (genre) filter.genre = genre;
    if (platform) filter.platform = platform;
    if (developer) filter.developer = developer;
    if (minScore) filter.metascore = { ...filter.metascore, $gte: Number(minScore) };
    if (maxScore) filter.metascore = { ...filter.metascore, $lte: Number(maxScore) };
    if (q) filter.title = { $regex: q, $options: 'i' };

    const count = await Game.countDocuments(filter);
    const games = await Game.find(filter)
        .skip((page - 1) * limit)
        .limit(Number(limit));

    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
    const links = {
        self: `${baseUrl}?page=${page}&limit=${limit}`,
        first: `${baseUrl}?page=1&limit=${limit}`,
        last: `${baseUrl}?page=${Math.ceil(count / limit)}&limit=${limit}`
    };
    if (page > 1) links.prev = `${baseUrl}?page=${page - 1}&limit=${limit}`;
    if (page < Math.ceil(count / limit)) links.next = `${baseUrl}?page=${Number(page) + 1}&limit=${limit}`;

    res.json({ total: count, page: Number(page), pageSize: Number(limit), games, _links: links });
};

export const searchGames = async (req, res) => {
    const { q } = req.query;
    if (!q) {
        return res.status(400).json({ message: 'Missing search query' });
    }
    try {
        const result = await index.search(q);
        res.json(result.hits);
    } catch (e) {
        res.status(500).json({ message: 'Algolia search failed' });
    }
};

export const getGameById = async (req, res) => {
    const game = await Game.findById(req.params.id);
    if (!game) {
        return res.status(404).json({ message: 'Game not found' });
    }
    res.json(game);
};

export const createGame = async (req, res) => {
    let imageUrl = null;
    if (req.file) {
        // Redimensionner l’image
        const resized = await sharp(req.file.buffer).resize(600, 400).jpeg().toBuffer();
        // Clé unique pour Netlify Blobs
        const blobKey = `games/${Date.now()}-${req.file.originalname}`;
        const blob = await netlifyBlobs.put(blobKey, resized, {
            access: 'public',
            token: process.env.NETLIFY_BLOBS_TOKEN,
            contentType: 'image/jpeg'
        });
        imageUrl = blob.url;
    }
    const game = new Game({ ...req.body, imageUrl, createdBy: req.user._id });
    await game.save();
    res.status(201).json(game);
};

export const updateGame = async (req, res) => {
    const game = await Game.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!game) {
        return res.status(404).json({ message: 'Game not found' });
    }
    res.json(game);
};

export const deleteGame = async (req, res) => {
    const game = await Game.findByIdAndDelete(req.params.id);
    if (!game) {
        return res.status(404).json({ message: 'Game not found' });
    }
    res.json({ message: 'Game deleted' });
};
