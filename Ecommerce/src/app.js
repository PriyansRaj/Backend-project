import express from "express";
import { errorMiddleWare } from "./middlewares/error.middleware";
import helmet from "helmet"
import cors from "cors";
import cookieParser from "cookie-parser"
const app = express();
app.use(express.json({
    limit:"16kb",
    strict:true
}))
app.use(cookieParser())
app.use(express.urlencoded({
    extended:true,
    limit:"16kb"
}))
app.use(helmet())
app.use(cors({
    origin:"*",
    credentials:true
}))

app.use(errorMiddleWare)
export default app;