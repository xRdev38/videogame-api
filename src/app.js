require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const gamesRouter = require('./routes/games');
const authRouter = require('./routes/auth');
const setupSwagger = require('./swagger');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use('/auth', authRouter);
app.use('/games', gamesRouter);
setupSwagger(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('API running on port', PORT));
