import mongoose from "mongoose";
export const connectDB = async()=>{
    try {
        mongoose.connect(process.env.MONGODB_URI);
        console.log("Database connected successfully");
    } catch (error) {
        console.error(error.message);
    }
}

