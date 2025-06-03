import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import Game from '../models/Game.js';
import auth from '../middleware/auth.js';
import permissions from '../middleware/permissions.js';
import algoliasearch from 'algoliasearch';
import multer from 'multer';
import sharp from 'sharp';
import * as netlifyBlobs from '@netlify/blobs';

const router = express.Router();

const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID;
const ALGOLIA_SEARCH_KEY = process.env.ALGOLIA_SEARCH_KEY;
const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY);
const index = client.initIndex('videogames');

const upload = multer({ limits: { fileSize: 3 * 1024 * 1024 } });

/**
 * @swagger
 * tags:
 *   name: Games
 *   description: Video game management
 */

/**
 * @swagger
 * /games:
 *   get:
 *     summary: Get a paginated list of games
 *     tags: [Games]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Current page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Genre filter
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *         description: Platform filter
 *       - in: query
 *         name: developer
 *         schema:
 *           type: string
 *         description: Developer filter
 *       - in: query
 *         name: minScore
 *         schema:
 *           type: integer
 *         description: Minimum metascore
 *       - in: query
 *         name: maxScore
 *         schema:
 *           type: integer
 *         description: Maximum metascore
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Title search
 *     responses:
 *       200:
 *         description: List of games
 */
router.get('/', async (req, res) => {
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
});


/**
 * @swagger
 * /games/search:
 *   get:
 *     summary: Search games using Algolia
 *     tags: [Games]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', async (req, res) => {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: 'Missing search query' });
    try {
        const result = await index.search(q);
        res.json(result.hits);
    } catch (e) {
        console.log("Erreur",e)
        res.status(500).json({ message: 'Algolia search failed' });
    }
});


/**
 * @swagger
 * /games/{id}:
 *   get:
 *     summary: Get a game by ID
 *     tags: [Games]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Game ID
 *     responses:
 *       200:
 *         description: The requested game
 *       404:
 *         description: Game not found
 */
router.get('/:id', async (req, res) => {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ message: 'Game not found' });
    res.json(game);
});

/**
 * @swagger
 * /games:
 *   post:
 *     summary: Create a new game (with optional image)
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               platform:
 *                 type: string
 *               releaseYear:
 *                 type: integer
 *               genre:
 *                 type: string
 *               developer:
 *                 type: string
 *               metascore:
 *                 type: integer
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Game created
 *       401:
 *         description: Unauthorized
 */
router.post('/', auth, upload.single('image'), async (req, res) => {
    let imageUrl = null;
    if (req.file) {
        const resized = await sharp(req.file.buffer).resize(600, 400).jpeg().toBuffer();
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
});

/**
 * @swagger
 * /games/{id}:
 *   put:
 *     summary: Update a game (author only)
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Game ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               platform:
 *                 type: string
 *               releaseYear:
 *                 type: integer
 *               genre:
 *                 type: string
 *               developer:
 *                 type: string
 *               metascore:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Game updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Game not found
 */
router.put('/:id', auth, permissions, async (req, res) => {
    const game = await Game.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!game) return res.status(404).json({ message: 'Game not found' });
    res.json(game);
});


/**
 * @swagger
 * /games/{id}:
 *   delete:
 *     summary: Delete a game (author only)
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Game ID
 *     responses:
 *       200:
 *         description: Game deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Game not found
 */
router.delete('/:id', auth, permissions, async (req, res) => {
    const game = await Game.findByIdAndDelete(req.params.id);
    if (!game) return res.status(404).json({ message: 'Game not found' });
    res.json({ message: 'Game deleted' });
});

export default router;
