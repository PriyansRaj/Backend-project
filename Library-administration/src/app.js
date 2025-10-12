import express from "express"
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js"
import cookieParser from "cookie-parser"
const app = express();
app.use(express.json())
app.use(cookieParser())
app.use("/api/v1/users",userRoutes)
app.use("/api/v1/admin",adminRoutes)
export default app;