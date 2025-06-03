import Game from '../models/Game.js';

const permissions = async (req, res, next) => {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ message: 'Game not found' });
    if (!game.createdBy.equals(req.user._id)) return res.status(403).json({ message: 'Forbidden' });
    next();
};

export default permissions;
