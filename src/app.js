import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// handling middlewares
app.use(cors());
app.use(express.json({
    limit: "16kb"
}));
app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}));
app.use(express.static("public"));
app.use(cookieParser());

// user route
import userRouter from "./Routes/user.routes.js"
app.use("/api/v1/users", userRouter);

// list route
import listRouter from "./Routes/list.routes.js"
app.use("/api/v1/list", listRouter);

// ping route
import pingRouter from "./Routes/ping.routes.js"
app.use("/api/v1/ping", pingRouter);

export {app}