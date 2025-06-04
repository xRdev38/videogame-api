import express from 'express';
import multer from 'multer';
import auth from '../middleware/auth.js';
import permissions from '../middleware/permissions.js';
import {
    getGames,
    searchGames,
    getGameById,
    createGame,
    updateGame,
    deleteGame
} from '../controllers/gamesController.js';

const router = express.Router();
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
router.get('/', getGames);

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
router.get('/search', searchGames);

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
router.get('/:id', getGameById);

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
router.post('/', auth, upload.single('image'), createGame);

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
router.put('/:id', auth, permissions, updateGame);

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
router.delete('/:id', auth, permissions, deleteGame);

export default router;