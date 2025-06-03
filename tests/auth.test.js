import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import User from '../src/models/User.js';
import authRouter from '../src/routes/auth.js';

const app = express();
app.use(express.json());
app.use('/auth', authRouter);

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
    await User.deleteMany({});
});
afterAll(async () => {
    await mongoose.connection.close();
});

describe('Auth routes', () => {
    it('should register a new user', async () => {
        const res = await request(app).post('/auth/register').send({ username: 'tester', password: 'testpass' });
        expect(res.statusCode).toBe(201);
    });

    it('should not register the same user twice', async () => {
        const res = await request(app).post('/auth/register').send({ username: 'tester', password: 'testpass' });
        expect(res.statusCode).toBe(400);
    });

    it('should login a user', async () => {
        const res = await request(app).post('/auth/login').send({ username: 'tester', password: 'testpass' });
        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeDefined();
    });

    it('should not login with bad password', async () => {
        const res = await request(app).post('/auth/login').send({ username: 'tester', password: 'wrongpass' });
        expect(res.statusCode).toBe(400);
    });
});
