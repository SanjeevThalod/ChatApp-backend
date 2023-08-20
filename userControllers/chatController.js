const asyncHandler = require('express-async-handler');
const User = require('../Models/userModel');
const Chat = require('../Models/chatModel');

const accessChat = asyncHandler(async (req, res) => {
    const { userId } = req.body;
    if (!userId) {
        return res.status(401).send('UserId not Present');
    }
    let isChat = await Chat.find({
        isGroupChat: false,
        users: { $all: [req.user._id, userId] }
    }).populate("users", "-passwords").populate("latestMessage");
    isChat = await User.populate(isChat, {
        path: "latestMessage.sender",
        select: "name pic email"
    });
    if (isChat.length > 0) {
        res.send(isChat[0]);
    } else {
        var chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.user._id, userId]
        }
        try {
            const createdChat = await Chat.create(chatData);
            const fullChat = await Chat.findOne({ _id: createdChat._id }).populate("users", "-password");
            res.status(200).send(fullChat);
        } catch (error) {
            res.status(400);
            throw new Error(error);
        }
    }
});

const fetchChat = asyncHandler(async (req, res) => {
    try {
        const result = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate({
                path: "latestMessage",
                populate: {
                    path: "sender",
                    select: "name pic email"
                }
            })
            .sort({ updatedAt: -1 });

        if (result.length === 0) {
            return res.status(404).send("No matching chat found.");
        }
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send("Error fetching chat.",error);
    }
});


const createGroupChat = asyncHandler(async (req, res) => {
    if (!req.body.users || !req.body.name) {
        return res.status(400).send({ message: "Please Fill all the fields" });
    }
    var users = JSON.parse(req.body.users);
    if (users.length < 2) {
        return res.status(400).send("More than 2 users are required");
    }
    users.push(req.user);
    try {
        const groupChat = await Chat.create({
            chatName: req.body.name,
            users: users,
            isGroupChat: true,
            groupAdmin: req.user
        })
        const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");
        res.status(200).json(fullGroupChat);
    } catch (error) {
        res.status(400);
        throw new Error(error);
    }
});

const renameGroup = asyncHandler(async (req, res) => {
    const { chatId, chatName } = req.body;
    const updatedChat = await Chat.findByIdAndUpdate(chatId, {
        chatName: chatName
    },
        {
            new: true
        })
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

    if (!updatedChat) {
        res.status(404);
        throw new Error("Chat Not Found");
    } else {
        res.json(updatedChat);
    }
});

const addGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;
    const added = await Chat.findByIdAndUpdate(chatId, {
        $push: { users: userId }
    }, { new: true })
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

    if (!added) {
        res.status(404);
        throw new Error("Chat Not Found");
    } else {
        res.json(added);
    }
});

const removeGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body;

    const removed = await Chat.findByIdAndUpdate(chatId, {
        $pull: { users: userId }
    }, { new: true })
        .populate("users", "-password")
        .populate("groupAdmin", "-password");
    if (!removed) {
        res.status(404);
        throw new Error("Chat Not Found");
    } else {
        res.json(removed);
    }

});

module.exports = { accessChat, fetchChat, createGroupChat, renameGroup, removeGroup, addGroup };