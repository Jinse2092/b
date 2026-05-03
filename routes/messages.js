const express = require('express');
const router = express.Router();
const { getMessages, getAllUsers, getCameraRoll, uploadImage } = require('../controllers/messageController');
const { verifyToken } = require('../middleware/auth');

router.get('/users', getAllUsers);
router.get('/camera-roll/:userId', getCameraRoll);
router.get('/:userId', getMessages);
router.post('/upload', uploadImage);

module.exports = router;
