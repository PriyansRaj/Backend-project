import e from "express";
import { User } from "../models/User.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import Response from "../utils/Response.js";
import { Book } from "../models/Book.model.js";
export const getAllUser = async (req, res) => {
  try {
    const users = await User.find({}).select("-refreshToken -password");
    return res
      .status(201)
      .json(new Response(201, users, "Users fetched Successfully"));
  } catch (error) {
    return res
      .status(error.statusCode || 400)
      .json(new Response(error.statusCode || 400, {}, "Failed to fetch users"));
  }
};

export const removeUser = async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findOneAndDelete({ username });
    if (!user) {
      throw new ErrorHandler(404, "User not found");
    }
    return res
      .status(200)
      .json(new Response(200, {}, "User deleted Successfully"));
  } catch (error) {
    return res.status(error.statusCode || 400).json(new Response(error.statusCode ||400, {}, error.message || "Failed to delete user"));
  }
};

export const updateRole = async (req, res) => {
  try {
    const { username, newRole } = req.body;
    if(!username || !newRole) 
        throw new ErrorHandler(400,"username and role are required")
    const user = await User.findOneAndUpdate(
      { username },
      {
        $set: { role: newRole },
      },
      {
        new: true,
        runValidators: false,
      }
    ).select("-password -refreshToken");
    if(!user) throw new ErrorHandler(404,"User not found");
    return res.status(200).json(new Response(200,user,"Role updated successfully"));

  } catch (error) {
    return res.status(error.statusCode || 500).json(new Response(error.statusCode || 500,{},error.message || "Failed to update role"))
  }
};

export const getAllBooks = async(req,res)=>{
    try {
        const books = await Book.find({})
        return res.status(200).json(new Response(200,books,"Books fetched successfully"));
    } catch (error) {
        return res.status(error.statusCode || 500).json(new Response(error.statusCode || 500,{},error.message || "Failed to fetch books"))
    }
}

export const toggleUSerStatus = async(req,res)=>{
    try {
        const {username,isActive} = req.body;
        if(typeof isActive !=='boolean')
            throw new ErrorHandler(400,"isAtive must be true or false");
        const user =await User.findOneAndUpdate(
            {
                username
            },
            {
                $set:{isActive}
            },
            {new:true}
        ).select("-password -refreshToken");
        if(!user) throw new ErrorHandler(404,"User not found")
            return res.status(200).json(new Response(200,user,`User is ${isActive?"Activated":"suspended"} successfully`))

    } catch (error) {
        
        return res
      .status(error.statusCode || 500)
      .json(new Response(error.statusCode || 500, {}, error.message));

    }
}

export const getUserByUsername =async(req,res)=>{
    try {
        const {username} = req.params;
        const user = await User.findOne({username}).select("-password -refreshToken");
        if(!user) throw new ErrorHandler(404,"User not found");
        return res.status(200).json(new Response(200,user,"User fetched successfully"));
    } catch (error) {
        return res.status(error.statusCode || 400).json(
            new Response(error.statusCode || 400,{},error.message)
        )
    }
}

export const getActiveUsers = async(req,res)=>{
    try {
        const users = await User.find({isActive:true}).select("-password -refreshToken");
        return res.status(200).json(new Response(200,users,"Active Users fetched"))
    } catch (error) {
        return res.status(error.statusCode || 500).json(new Response(error.statusCode || 500,{},error.message));
    }
}


export const adminPasswordReset = async(req,res)=>{
    try {
        const {username,newPassword} = req.body;
        if(!username || !newPassword){
            throw new ErrorHandler(400,"Username and new Password are required");
        }
        const user = await User.findOne({username});
        if(!user) throw new ErrorHandler(404,"User not found");
        user.password = newPassword;
        await user.save({validateBeforeSave:false});
        return res.status(200).json(new Response(200,{},"Password reset successfully"));
    } catch (error) {
       return res
      .status(error.statusCode || 500)
      .json(new Response(error.statusCode || 500, {}, error.message));
    }
}


export const getUserStats = async (req,res)=>{
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({isActive:true});
        const roles  = await User.aggregate([
            {
                $group:{_id:"$role",count:{$sum:1}}
            }
        ])
        return res.status(200).json(new Response(200,{totalUsers,activeUsers,roles},"User stats fetched Successfully"));

    } catch (error) {
         return res
      .status(error.statusCode || 500)
      .json(new Response(error.statusCode || 500, {}, error.message));
        
    }
}

