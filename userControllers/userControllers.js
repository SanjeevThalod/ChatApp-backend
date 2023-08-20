const asyncHandler = require('express-async-handler');
const generateToken = require('../Config/generateToken');
const User = require('../Models/userModel');

// Registering User
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, pic } = req.body;
    if (!name || !email || !password) {
        res.status(400).json({ error: 'Enter all fields' });
    }

    // Checking if email already in Use
    const userExists = await User.findOne({ email: email });
    if (userExists) {
        res.status(400);
        throw new Error('Email already in Use');
    }

    // Creating new User
    const user = await User.create({
        name,
        password,
        email,
        pic
    });

    if (user) {
        res.status(201).json({ Success: "User Created", token: generateToken(user._id), name: user.name, email: user.email, pic: user.pic,_id:user._id });
    } else {
        res.status(400)
        throw new Error("Couldn't create new User")
    }
});

const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (user && (await user.matchPassword(password))) {
        res.status(201).json({ success: "User authorised", token: generateToken(user._id), name: user.name, email: user.email, pic: user.pic,_id:user._id });
    } else {
        throw new Error("Couldn't Login");
    }
});

const allUsers = asyncHandler(async (req, res) => {
    const keyword = req.query.search ? {
        $or: [
            { name: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } }
        ]
    } : {};
    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });

    res.json(users);
});

module.exports = { registerUser, authUser, allUsers };