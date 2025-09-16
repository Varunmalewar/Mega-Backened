const mongoose = require('mongoose');
require('dotenv').config();


exports.connectDB = async () => {

    try{
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Database connected successfully");

    }
    catch(err){
        console.log("Database connection failed", err);
        process.exit(1);
        

    }

}