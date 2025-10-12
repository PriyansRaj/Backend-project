import ErrorHandler from "../utils/ErrorHandler.js";
import { User } from "../models/User.model.js";
import Response from "../utils/ResponseHandler.js";
import jwt from "jsonwebtoken";
const getAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { refreshToken, accessToken };
  } catch (err) {
    throw new ErrorHandler(500, "Could not generate refresh and access tokens");
  }
};
export const signUp = async (req, res) => {
  try {
    const { username, fullName, email, role, password } = req.body;
    if (!username || !fullName || !email || !role || !password) {
      throw new ErrorHandler(400, "All the fields are required");
    }
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      throw new ErrorHandler(400, "Username or email already exists");
    }
    const newUser = new User({
      username,
      fullName,
      email,
      password,
      role,
    });
    const savedUser = await newUser.save();
    savedUser.password = undefined;
    if (!savedUser) {
      throw new ErrorHandler(401, "Failed to save in database");
    }
    return res
      .status(201)
      .json(
        new Response(201, savedUser, "User registered successfully")
      );
  } catch (error) {
    return res
      .status(error.statusCode || 500)
      .json(new Response(error.statusCode || 500, [], error.message));
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    if (!username || !password) {
      throw new ErrorHandler(400, "Username and password is required");
    }
    const user = await User.findOne({ username });
    if (!user) {
      throw new ErrorHandler(404, "User not found");
    }
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      throw new ErrorHandler(401, "Incorrect Password");
    }
    const { refreshToken, accessToken } = await getAccessAndRefreshToken(
      user._id
    );
    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
    loggedInUser.isActive=true;
    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
    return res
      .status(201)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new Response(201, loggedInUser, "Login successful"));
  } catch (error) {
    res
      .status(error.statusCode || 400)
      .json(new Response(error.statusCode || 400, error.message));
  }
};

export const logoutUser = async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: undefined,isActive:false },
    },
    {
      new: true,
      runValidators: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new Response(200, {}, "User logout successfully"));
};

export const getCurrentUser = (req, res) => {
  return res
    .status(200)
    .json(
      new Response(200, req.user, "Current user fetch successfully")
    );
};

export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!newPassword) throw new ErrorHandler(400, "New Password is required");
  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.comparePassword(oldPassword);
  if (!isPasswordCorrect) throw new ErrorHandler(401, "Invalid Password");
  user.password = newPassword;
  await user.save({ validateBeforeSave: false });
  const loginUser = await User.findById(user._id).select("-password -refreshToken");

  return res
    .status(200)
    .json(new Response(200, loginUser, "Password Changed successfully"));
};

export const refreshAccessToken = async (req, res) => {
  const IncomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!IncomingRefreshToken) {
    throw new ErrorHandler(401, "Unauthorized Access");
  }
  try {
    const decodedToken = jwt.verify(
      IncomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ErrorHandler(401, "Invalid Refresh Token");
    }
    if (IncomingRefreshToken !== user.refreshToken) {
      throw new ErrorHandler(401, "Refresh Token is expired or used");
    }
    const options = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken, refreshToken } = await getAccessAndRefreshToken(
      user._id
    );
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .json(new Response(200,loggedInUser , "Access Token Refreshed"));
  } catch (error) {
    return res
      .status(error.statusCode || 401)
      .json(
        new Response(
          error.statusCode || 401,
          {},
          error.message || "Error while refreshing token"
        )
      );
  }
};

export const updateDetails = async (req, res) => {
  const { email, phoneNum } = req.body;
  if (!email || !phoneNum) {
    throw new ErrorHandler(400, "Details must not be empty");
  }
  try {
    console.log(req.user)
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: { email, phoneNum },
      },
      {
        new: true,
        runValidators: false,
      }
    ).select("-password -refreshToken");
    if (!user) {
      throw new ErrorHandler(404, "User not found");
    }
    return res
      .status(201)
      .json(new Response(201, user, "Details updated successfully"));
  } catch (error) {
    return res
      .status(error.statusCode || 401)
      .json(
        new Response(
          error.statusCode || 401,
          {},
          "Error while updating details"
        )
      );
  }
};

export const deleteAccount = async (req,res)=>{
    try {
        const user = await User.findByIdAndDelete(req.user?._id);
        if(!user) throw new ErrorHandler(404,"User not found");
         return res
      .status(200) 
      .json(new Response(200, {}, "User deleted successfully"));
    } catch (error) {
        return res.status(error.statusCode || 500).json(new Response(error.statusCode || 500,{},"Unable to delete user"))
    }
}



