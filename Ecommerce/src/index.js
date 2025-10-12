import app from "./app.js";
import dotenv from "dotenv";
dotenv.config()
import { connectDB } from "./db/connectDB.js";
const PORT = process.env.PORT || 8000
await connectDB()
.then(()=>{
    app.listen(PORT,()=>{
        console.log(`App is listening to port ${PORT}.`)
    })
})
.catch((err)=>{
    console.error(error)
})