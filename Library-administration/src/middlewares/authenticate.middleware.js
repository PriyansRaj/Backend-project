import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";

export const verifyJWT=async(req,res,next)=>{
    try {
        const accessToken =  req.headers.authorization?.replace("Bearer ", "") ||req.cookies?.accessToken || req.body.accessToken;
        if(!accessToken){
            throw new ErrorHandler(401,"Access Token undefined or expired");
        }
        const decodedToken = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET);
        if (!decodedToken?._id) {
            throw new ErrorHandler(403, "Invalid Token");
            }
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        if(!user){
            throw new ErrorHandler(404,"User not found");
        }
        req.user = user;
        req.role = user.role;
        next();
    } catch (error) {
        next(error)
    }
}


export const authorizedRoles = (allowedRole)=>{
    return (req,res,next)=>{
        try {
            if(!req.user?.role){
                throw new ErrorHandler(400, "User role not found");
            }
            if(!allowedRole.includes(req.user?.role)){
                throw new ErrorHandler(403, "Unauthorized: Access denied");
            }
            next()
        } catch (error) {
            next(error)
            
        }
    }
}