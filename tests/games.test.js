const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const gamesRouter = require('../src/routes/games');
const Game = require('../src/models/Game');

const app = express();
app.use(express.json());
app.use('/games', gamesRouter);

beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/videogames_test', { useNewUrlParser: true, useUnifiedTopology: true });
    await Game.deleteMany({});
    await Game.create({ title: "Test Game", platform: ["PC"], releaseYear: 2022, genre: "Action", developer: "TestDev", metascore: 90 });
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('GET /games', () => {
    it('should return paginated games', async () => {
        const res = await request(app).get('/games');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.games)).toBe(true);
    });
});

describe('POST /games', () => {
    it('should create a new game', async () => {
        const res = await request(app)
            .post('/games')
            .send({ title: "Another Game", platform: ["PC"], releaseYear: 2020, genre: "Adventure", developer: "Dev2", metascore: 80 });
        expect(res.statusCode).toBe(201);
        expect(res.body.title).toBe("Another Game");
    });
});
