import dotenv from 'dotenv';
dotenv.config();
import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import Game from '../src/models/Game.js';
import User from '../src/models/User.js';
import gamesRouter from '../src/routes/games.js';
import authRouter from '../src/routes/auth.js';

const app = express();
app.use(express.json());
app.use('/auth', authRouter);
app.use('/games', gamesRouter);

let token, gameId;

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
    await User.deleteMany({});
    await Game.deleteMany({});
    // Register and login user
    await request(app).post('/auth/register').send({ username: 'gameuser', password: 'gamepass' });
    const res = await request(app).post('/auth/login').send({ username: 'gameuser', password: 'gamepass' });
    token = res.body.token;
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('Games CRUD', () => {
    it('should not allow creation without token', async () => {
        const res = await request(app).post('/games').send({ title: 'Zelda' });
        expect(res.statusCode).toBe(401);
    });

    it('should create a game (with token)', async () => {
        const res = await request(app)
            .post('/games')
            .set('Authorization', `Bearer ${token}`)
            .field('title', 'Zelda')
            .field('platform', 'Switch')
            .field('releaseYear', 2017)
            .field('genre', 'Adventure')
            .field('developer', 'Nintendo')
            .field('metascore', 97);
        expect(res.statusCode).toBe(201);
        expect(res.body.title).toBe('Zelda');
        gameId = res.body._id;
    });

    it('should list games', async () => {
        const res = await request(app).get('/games');
        expect(res.statusCode).toBe(200);
        expect(res.body.games.length).toBeGreaterThan(0);
    });

    it('should get a single game by id', async () => {
        const res = await request(app).get(`/games/${gameId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body._id).toBe(gameId);
    });

    it('should not update game with another user', async () => {
        await request(app).post('/auth/register').send({ username: 'otheruser', password: 'pass' });
        const login = await request(app).post('/auth/login').send({ username: 'otheruser', password: 'pass' });
        const res = await request(app)
            .put(`/games/${gameId}`)
            .set('Authorization', `Bearer ${login.body.token}`)
            .send({ title: 'Hack' });
        expect(res.statusCode).toBe(403);
    });

    it('should update a game (author)', async () => {
        const res = await request(app)
            .put(`/games/${gameId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Zelda Updated' });
        expect(res.statusCode).toBe(200);
        expect(res.body.title).toBe('Zelda Updated');
    });

    it('should delete a game (author)', async () => {
        const res = await request(app)
            .delete(`/games/${gameId}`)
            .set('Authorization', `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toBe('Game deleted');
    });

    it('should return 404 when getting deleted game', async () => {
        const res = await request(app).get(`/games/${gameId}`);
        expect(res.statusCode).toBe(404);
    });
});