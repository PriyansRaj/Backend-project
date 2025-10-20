import { Order } from '../models/Orders.model.js';
import { User } from '../models/User.model.js';
import { ApiError } from '../utils/error.utils.js';
import { Response } from '../utils/response.utils.js';
import { orderItem } from './user.controller.js';

const getOrderID = async (username) => {
  try {
    if (!username) throw new ApiError(400, 'Username is required');
    const user = await User.findOne({ name: username });
    if (!order) throw new ApiError(404, 'User not found');
    const order = await Order.findOne({ user_id: user._id });
    if (!order) throw new ApiError(404, 'Order not found');
    return order._id;
  } catch (error) {
    throw new ApiError(
      error.statusCode || 500,
      error.message || 'Something went wrong: Unable to get order id'
    );
  }
};
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
    const { email, phone } = req.params;

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
    const { phone, email } = req.params;

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
    const { phone, email } = req.params;

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

export const changeOrderStatus = async (req, res, next) => {
  try {
    const { username } = req.params;
    const { newStatus } = req.body;

    if (!username) throw new ApiError(400, 'User name is required');
    const order_id = getOrderID(username);
    if (!newStatus) throw new ApiError(400, 'New order status is required');

    const validStatuses = ['placed', 'cancelled', 'delivered', 'onway'];
    if (!validStatuses.includes(newStatus.toLowerCase())) {
      throw new ApiError(400, `Invalid status. Allowed values: ${validStatuses.join(', ')}`);
    }
    const order = await Order.findByIdAndUpdate(
      order_id,
      {
        $set: { status: newStatus.toLowerCase() },
      },
      {
        new: True,
        runValidators: true,
      }
    );
    if (!order) throw new ApiError(404, 'Order not available');
    return res
      .status(200)
      .json(new Response(200, order, `Order status updated to ${newStatus} successfully`));
  } catch (error) {
    next(error);
  }
};

export const getUserOrderHistory = async (req, res, next) => {
  try {
    const { username } = req.params;
    if (!username) throw new ApiError(400, 'Username is required');
    const user = await User.findOne({ name: username });
    const order = await Order.findOne({ user_id: user._id }).sort({ createdAt: -1 });
    const OrdersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await orderItem.find({ order: order._id }).populate('product');
        return {
          orderId: order._id,
          status: order.status,
          totalAmount: order.total_amount,
          createdAr: order.createdAt,
          items: items.map((i) => ({
            productName: i.product.name,
            quantity: i.quantity,
            price: i.price,
            subtotal: i.subtotal,
          })),
        };
      })
    );
    return res
      .status(200)
      .json(new Response(200, OrdersWithItems, 'Orders history fetched Successfully'));
  } catch (error) {
    next(error);
  }
};
