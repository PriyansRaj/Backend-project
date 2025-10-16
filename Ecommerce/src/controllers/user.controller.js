import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { ApiError } from "../utils/error.utils.js"
import { Response } from "../utils/Response.utils.js"
import { User } from "../models/User.model.js"

const getAccessAndRefreshToken = async(userId)=>{
    try {
        const user = await User.findById(userId);
        if(!user) throw new ApiError(404,"User not found");
        const refreshToken = user.createRefeshToken();
        const accessToken = user.createAccessToken();
        user.refreshToken = refreshToken;
        await user.save({
            validateBeforeSave:false
        })
        return {refreshToken,accessToken};
    } catch (error) {
        throw new ApiError(error.statusCode || 500,error.message || "Internal server error: Unable to create refresh and access tokens")
        
    }
}
export const signup = async(req,res,next)=>{
    try {
        const {name,email,password,role,phone} = req.body;
        if(!name || !email || !password || !role ||!phone){
            throw new ApiError(400,"All fields are required to create a new user.")
        }
        const existUser = await User.findOne({$or:[{name},{email}]});
        if(existUser) throw new ApiError(400,"User already exists.");
        const newUser = new User({name,email,password,role,phone});
        const savedUser = await newUser.save()
        savedUser.password = undefined;
        const {refreshToken,accessToken} = await getAccessAndRefreshToken(savedUser._id);
        const options={
            httpOnly:true,
            secure:true,
            sameSite:"Strict",
            maxAge: 7*24*60*60*1000,
        }
        return res.status(201)
        .cookie("refreshToken",refreshToken,options)
        .json(new Response(201,{user:savedUser,accessToken},"User created successfully"));
    } catch (error) {
        next(error)
    }
}

export const login = async(req,res,next)=>{
    try {
        const{phone,email,password} = req.body;
        if((!phone && !email) || !password){
             throw new ApiError(400,"Missing fields")
        }
        const query = phone ? { phone } : { email };
        const user = await User.findOne(query)
        if(!user) throw new ApiError(404,"User not found");
        const isPasswordValid = await user.comparePassword(password);
        if(!isPasswordValid) throw new ApiError(401,"Incorrect password");
        const {refreshToken,accessToken} = await getAccessAndRefreshToken(user._id);
        const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
        const options = {
            httpOnly: true,
            secure: true,
            sameSite: "Strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            };
        return res.status(200)
        .cookie("refreshToken",refreshToken,options)
        .json(new Response(200,{user: loggedInUser,accessToken},"User login successful"))

    } catch (error) {
        next(error)
    }
}

export const logout = async(req,res,next)=>{
    try {
        const userid = req.user?._id;
        if(!userid) throw new ApiError(401,"Unauthenticated");
        const user = await User.findByIdAndUpdate(userid,{refreshToken:null},{
            new:true,
            runValidators:false
        });
        res.clearCookie("refreshToken");
        return res.status(200).json(new Response(200,{},"Logged out successfully"))
    } catch (error) {
        next(error)
    }
}



export const refreshAccessToken = async(req,res,next)=>{
    try {
        const IncomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;
        if(!IncomingRefreshToken) throw new ApiError(401,"Expired or unauthenticated refresh token");
        const decodedToken = jwt.verify(IncomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id);
        if(!user) throw new ApiError(404,"User not found");
        const options = {
            httpOnly:true,
            secure:true,
            sameSite:"Strict",
            maxAge:7*24*60*60*1000
        }
        const {refreshToken,accessToken} = await getAccessAndRefreshToken(user._id);
        return res.status(200)
        .cookie("accessToken",refreshToken,options)
        .json(new Response(200,{accessToken},"Refresh token refreshed successfully"))

    } catch (error) {
        next(error)
    }
}