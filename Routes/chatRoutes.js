const express = require('express');
const protect = require('../middleware/authMiddleware');
const { accessChat, fetchChat, createGroupChat, renameGroup, removeGroup, addGroup } = require('../userControllers/chatController')
const router = express.Router();

router.post('/', protect, accessChat);
router.get('/', protect, fetchChat);
router.post('/group',protect,createGroupChat);
router.put('/group/rename',protect,renameGroup);
router.put('/group/remove',protect,removeGroup);
router.put('/group/add',protect,addGroup);


module.exports = router;