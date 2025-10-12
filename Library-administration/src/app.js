import express from "express"
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js"
import bookRoutes from "./routes/book.routes.js"
import cookieParser from "cookie-parser"
import helmet from "helmet"
import cors from "cors"
const app = express();
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin:"*",
    credentials:true
}))
app.use(helmet())
app.use("/api/v1/users",userRoutes)
app.use("/api/v1/admin",adminRoutes)
app.use("/api/v1/books",bookRoutes)
export default app;