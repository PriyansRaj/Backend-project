import mongoose from "mongoose"

export const ConnectDB = async()=>{
    try{
        mongoose.connect(process.env.MONGODB_URI);
        console.log("DB connected successfully")
    }
    catch(err){
        throw err;
    }
}