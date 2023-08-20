const express = require('express');
const protect = require('../middleware/authMiddleware');
const { registerUser, authUser, allUsers } = require('../userControllers/userControllers');

const router = express.Router();
// EndPoints
router.post('/signup', registerUser);
router.post('/login', authUser);
router.get('/',protect,allUsers)

module.exports = router;