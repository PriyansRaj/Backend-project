import { User } from '../models/User.model.js';
import { ApiError } from '../utils/error.utils.js';
import jwt from 'jsonwebtoken';

export const authenticate = async (req, res, next) => {
  try {
    const accessToken = req.cookies?.accessToken || req.body.accessToken;
    if (!accessToken) throw new ApiError(401, 'Unauthenticated Access');
    const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    if (!decodedToken?._id) {
      throw new ErrorHandler(403, 'Invalid Token');
    }
    const user = await User.findById(decodedToken?._id).select('-password -refeshToken');
    if (!user) throw new ApiError(404, 'User not found');
    req.user = user;
    req.role = user.role;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorizeRoles = (...allowedRoles) => {
  try {
    if (!req.role) {
      throw new ApiError(400, 'User role not found');
    }
    if (!allowedRoles.includes(req.role)) {
      throw new ApiError(403, 'Unauthorized access');
    }
    next();
  } catch (error) {
    next(error);
  }
};
