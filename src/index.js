// require('dotenv').config({path:'./env'});//this line can give correct outputs but less professional because of consistency issues

//Approach 2:  Without polluting index.js file

import dotenv from "dotenv"
import connectDB from "./db/db.js";
import app from  "./app.js";
//for using the import statement we can say that we need to config the dotenv using config method
dotenv.config({
    path:'./.env'
})


connectDB()
    .then(() => {
        app.listen( 8000, () => {
            console.log(`Server is running at port : ${process.env.PORT || 8000}`);
        });
    })
    .catch((err) => {
        console.log("MONGO db connection failed !!!", err);
        process.exit(1);  // Exit the process if DB connection fails
    });












/*
//Approach 1: connection of database by polluting the index.js
import mongoose from "mongoose";
import { DB_NAME } from "./constants";
import express from "express"
const app = express();
(async () => {
    try {
        //connecting the database
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        app.on("error", (error) => {   //this line can listen to the error event
            console.log("Error: ", error);
            throw error;
        });  

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
        })
    }
    catch(error){
        console.error("ERROR: ", error)
        throw error
    }
})() */