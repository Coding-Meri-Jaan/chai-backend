import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";  

const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}));

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())

//we always import routes
import userRouter from './routes/user.routes.js'

//routes declaration , the below line is a middleware because we are importing the routes from somewhere else
app.use("/api/v1/users", userRouter) //we used to use app.get() when we didn't use the routers at the same file and now we are exporting so we need to just use the app.use() for doing so


// http://localhost:8000/users
export {app}