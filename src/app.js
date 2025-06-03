import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import gamesRouter from './routes/games.js';
import authRouter from './routes/auth.js';
import setupSwagger from './swagger.js';

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI);

app.use('/auth', authRouter);
app.use('/games', gamesRouter);
setupSwagger(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('API running on port', PORT));
