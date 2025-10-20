import { User } from '../models/User.model.js';
import { ApiError } from '../utils/error.utils.js';
import { Response } from '../utils/response.utils.js';

export const changeRole = async (req, res, next) => {
  try {
    const { phone, newRole } = req.body;

    if (!phone || !newRole) throw new ApiError(400, 'All fields are required');

    if (req.user?.phone === phone) throw new ApiError(403, "You can't change your own role");

    const user = await User.findOneAndUpdate(
      { phone },
      { $set: { role: newRole } },
      { new: true }
    ).select('-password -refreshToken');

    if (!user) throw new ApiError(404, 'User not found');

    return res.status(200).json(new Response(200, user, 'User role changed successfully'));
  } catch (error) {
    next(error);
  }
};

export const removeUser = async (req, res, next) => {
  try {
    const { phone, email } = req.body;

    if (!phone && !email) throw new ApiError(400, 'Either email or phone is required');

    const query = phone ? { phone } : { email };

    const user = await User.findOneAndDelete(query);

    if (!user) throw new ApiError(404, 'User not found');

    return res.status(200).json(new Response(200, {}, 'User deleted successfully'));
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const { email, phone } = req.body;

    if (!email && !phone) throw new ApiError(400, 'Either email or phone is required');

    const user = await User.findOne({
      $or: [{ email }, { phone }],
    }).select('-password -refreshToken');

    if (!user) throw new ApiError(404, 'User not found');

    return res.status(200).json(new Response(200, user, 'User fetched successfully'));
  } catch (error) {
    next(error);
  }
};

export const getAllUser = async (req, res, next) => {
  try {
    const users = await User.find().select('-password -refreshToken');

    return res.status(200).json(new Response(200, users, 'Users fetched successfully'));
  } catch (error) {
    next(error);
  }
};

export const deactiveUser = async (req, res, next) => {
  try {
    const { phone, email } = req.body;

    if (!phone && !email) throw new ApiError(400, 'Either email or phone is required');

    const query = phone ? { phone } : { email };
    const user = await User.findOneAndUpdate(query, { isActive: true }).select(
      '-password -refeshToken'
    );
    if (!user) throw new ApiError(404, 'User not found');
    return res.status(200).json(new Response(200, user, 'User suspended successfully'));
  } catch (error) {
    next(error);
  }
};

export const reactivateUser = async (req, res, next) => {
  try {
    const { phone, email } = req.body;

    if (!phone && !email) throw new ApiError(400, 'Either email or phone is required');

    const query = phone ? { phone } : { email };
    const user = await User.findOneAndUpdate(query, { isActive: true }).select(
      '-password -refeshToken'
    );
    if (!user) throw new ApiError(404, 'User not found');
    return res.status(200).json(new Response(200, user, 'User reactivated successfully'));
  } catch (error) {
    next(error);
  }
};
