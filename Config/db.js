require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.DB_KEY, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`Mongo connected: ${connection.connection.host}`);
    } catch (error) {
        console.log(`Error:${error}`);
        process.exit();
    }
}

module.exports = connectDB;