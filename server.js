require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./Config/db');
const userRoutes = require('./Routes/userRoutes');
const chatRoutes = require('./Routes/chatRoutes');
const messageRoute = require('./Routes/messageRoute');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Initialising Express
const app = express();
app.use(express.json());

// Connecting to Database
connectDB();

// Cors Policy
app.use(cors());

// Other Routes
app.use('/user', userRoutes);
app.use('/chat', chatRoutes);
app.use('/message', messageRoute);

// Base Route
app.get('/', (req, res) => {
    res.status(200).json({ "api": "running" });
});

// Error Handling routes
app.use(notFound);
app.use(errorHandler);

const server = app.listen(process.env.PORT, console.log(`Listening on ${process.env.PORT}`));

const io = require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});


io.on('connection', (socket) => {
    console.log('Connected to socket.io');
    socket.on('setup', (userData) => {
        socket.join(userData._id);
        socket.emit('connected');
    });
    socket.on('join chat', (room) => {
        socket.join(room);
        console.log('User joined ', room);
    });
    socket.on('new message', (newMessageRecieved) => {
        var chat = newMessageRecieved.chat;
        if (!chat.users) return console.log('chat.users not defined');

        chat.users.forEach(user => {
            if (user._id === newMessageRecieved.sender._id) return;

            socket.in(user._id).emit('message recieved', newMessageRecieved);
        })
    });
    socket.on('typing', (room) => socket.to(room).emit('typing'));
    socket.on('stop typing', (room) => socket.to(room).emit('stop typing'));

    socket.removeListener('setup', (userData) => {
        console.log('USER Disconnected');
        socket.leave(userData._id);
    });
    
})