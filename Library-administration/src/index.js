import app from "./app.js"
import dotenv from "dotenv";
dotenv.config()
import { ConnectDB } from "./db/ConnectDB.js"
const PORT = process.env.PORT || 8080
ConnectDB().then(
    app.listen(PORT,()=>{
        console.log(`App is listening at port ${PORT}`)
    })
).catch(err=>{
    console.error(err);
})