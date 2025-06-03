const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const gamesRouter = require('./routes/games');
const setupSwagger = require('./swagger');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/videogames', { useNewUrlParser: true, useUnifiedTopology: true });

app.use('/games', gamesRouter);
setupSwagger(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('API running on port', PORT));
