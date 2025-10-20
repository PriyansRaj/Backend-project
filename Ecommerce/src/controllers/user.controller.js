import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/error.utils.js';
import { Response } from '../utils/Response.utils.js';
import { User } from '../models/User.model.js';
import { Product } from '../models/Product.model.js';
import { Order } from '../models/Orders.model.js';
import { CartItem } from '../models/CartItem.model.js';
import { OrderItem } from '../models/OrderItem.model.js';
import password from '../middlewares/ password.middleware.js';
const getAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');
    const refreshToken = user.createRefeshToken();
    const accessToken = user.createAccessToken();
    user.refreshToken = refreshToken;
    await user.save({
      validateBeforeSave: false,
    });
    return { refreshToken, accessToken };
  } catch (error) {
    throw new ApiError(
      error.statusCode || 500,
      error.message || 'Internal server error: Unable to create refresh and access tokens'
    );
  }
};

export const signup = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password || !role || !phone) {
      throw new ApiError(400, 'All fields are required');
    }

    const existUser = await User.findOne({ $or: [{ name }, { email }] });
    if (existUser) throw new ApiError(400, 'User already exists');

    let avatar = null;
    if (req.file?.path) {
      avatar = {
        url: req.file.path,
        public_id: req.file.filename || req.file.path.split('/').pop(),
      };
    }

    const newUser = new User({ name, email, password, role, phone, avatar });
    const savedUser = await newUser.save();
    savedUser.password = undefined;

    const { refreshToken, accessToken } = await getAccessAndRefreshToken(savedUser._id);

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    return res
      .status(201)
      .cookie('refreshToken', refreshToken, options)
      .json(new Response(201, { user: savedUser, accessToken }, 'User created successfully'));
  } catch (error) {
    next(error);
  }
};

export const googleLogin = async (req, res, next) => {
  password.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
};

export const googleCallBack = (req, res, next) => {
  password.authenticate('google', { failureRedirect: '/api/v1/user/login' }, (err, user) => {
    if (err || !user) return next(new ApiError(401, 'Authentication failed'));
    const accessToken = jwt.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '15m',
    });
    res.cookie('accessToken', accessToken, { httpOnly: true });
    res.cookie('accessToken', accessToken, { httpOnly: true });
    return res
      .status(200)
      .json(new Response(200, { user, accessToken }, 'Google login successful'));
  })(req, res, next);
};

export const githubLogin = (req, res, next) => {
  passport.authenticate('github', { scope: ['user:email'] })(req, res, next);
};

export const githubCallback = (req, res, next) => {
  passport.authenticate('github', { failureRedirect: '/api/v1/user/login' }, (err, user) => {
    if (err || !user) return next(new ApiError(401, 'GitHub authentication failed'));

    const accessToken = jwt.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '15m',
    });

    res.cookie('accessToken', accessToken, { httpOnly: true });
    return res
      .status(200)
      .json(new Response(200, { user, accessToken }, 'GitHub login successful'));
  })(req, res, next);
};

export const login = async (req, res, next) => {
  try {
    const { phone, email, password } = req.body;
    if ((!phone && !email) || !password) {
      throw new ApiError(400, 'Missing fields');
    }
    const query = phone ? { phone } : { email };
    const user = await User.findOne(query);
    if (!user) throw new ApiError(404, 'User not found');
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) throw new ApiError(401, 'Incorrect password');
    const { refreshToken, accessToken } = await getAccessAndRefreshToken(user._id);
    const loggedInUser = await User.findById(user._id).select('-password -refreshToken');
    const options = {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
    return res
      .status(200)
      .cookie('refreshToken', refreshToken, options)
      .json(new Response(200, { user: loggedInUser, accessToken }, 'User login successful'));
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const userid = req.user?._id;
    if (!userid) throw new ApiError(401, 'Unauthenticated');
    const user = await User.findByIdAndUpdate(
      userid,
      { refreshToken: null },
      {
        new: true,
        runValidators: false,
      }
    );
    res.clearCookie('refreshToken');
    return res.status(200).json(new Response(200, {}, 'Logged out successfully'));
  } catch (error) {
    next(error);
  }
};

export const refreshAccessToken = async (req, res, next) => {
  try {
    const IncomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;
    if (!IncomingRefreshToken) throw new ApiError(401, 'Expired or unauthenticated refresh token');
    const decodedToken = jwt.verify(IncomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id);
    if (!user) throw new ApiError(404, 'User not found');
    const options = {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
    const { refreshToken, accessToken } = await getAccessAndRefreshToken(user._id);
    return res
      .status(200)
      .cookie('accessToken', refreshToken, options)
      .json(new Response(200, { accessToken }, 'Refresh token refreshed successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    const userid = req.user?._id;
    if (!userid) throw new ApiError(401, 'Unauthenticated access');
    const user = await User.findByIdAndDelete(userid);
    if (!user) throw new ApiError(404, 'User not found');
    res.clearCookie('refreshToken').clearCookie('accessToken');
    return res.status(200).json(new Response(200, {}, 'User deleted successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateAvatar = async (req, res, next) => {
  try {
    const userid = req.user?._id;
    if (!userid) {
      throw new ApiError(401, 'Unauthenticated access');
    }
    let newavatar = null;
    if (req.file) {
      newavatar = {
        url: req.file.path,
        public_id: req.file.filename || req.file.path.split('/').pop(),
      };
    }

    const user = await User.findByIdAndUpdate(userid, {
      avatar: newavatar,
    }).select('-password -refreshToken');
    if (!user) throw new ApiError(404, 'User not found');
    return res.status(200).json(new Response(200, user, 'User avatar updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateDetails = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const { name, email, phone } = req.body;

    if (!userId) throw new ApiError(401, 'Unauthenticated access');

    if (!name || !email || !phone) throw new ApiError(400, 'All fields are required');
    const user = await User.findOneAndUpdate(userId, {
      $set: { name, phone, email },
    }).select('-password -refreshToken');
    if (!user) throw new ApiError(404, 'User not found');
    return res.status(200).json(new Response(200, user, 'User details updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const { oldPassword, newPassword } = req.body;
    if (!userId) throw new ApiError(401, 'Unauthenticated access');
    if (!oldPassword || !newPassword) throw new ApiError(400, 'All fields are required');
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');
    const isPasswordValid = await user.comparePassword(oldPassword);
    if (!isPasswordValid) throw new ApiError(401, 'Incorrect password');
    user.password = newPassword;
    await user.save();
    user.password = undefined;
    return res.status(200).json(new Response(200, user, 'Password updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const addItemToCart = async (req, res, next) => {
  try {
    const { productName } = req.params;
    if (!productName) throw new ApiError(400, 'Product name is required');
    const product = await Product.findOne({ name: productName });
    if (!product) throw new ApiError(404, 'Product not available');
    let cart = await CartItem.findOne({ user: req.user?._id });
    if (oldCart) {
      let itemIndex = cart.items.findIndex(
        (item) => item.product.toString() === product,
        _id.toString()
      );
      if (itemIndex > -1) cart.items[itemIndex].quantity += 1;
      else cart.items.push[{ product: product._id, quantity: 1 }];
    } else
      cart = await CartItem({
        user: req.user?._id,
        items: { product: product._id, quantity: 1 },
      });
    cart.save();
    return res.status(200).json(new Response(200, newCart, 'Item added in cart'));
  } catch (error) {
    next(error);
  }
};

export const removeItemFromCart = async (req, res, next) => {
  try {
    const { productname } = req.params;
    if (!productname) throw new ApiError(400, 'Product name is required');
    const product = await Product.findOne({ name: productname });
    if (!product) throw new ApiError(404, 'Product not available');
    const cart = await CartItem.findOne({ user: req.user?._id });
    if (!cart) throw new ApiError(404, 'Cart not available');
    let index = cart.items.findIndex((item) => item.product.toString() === product._id.toString());
    if (index === -1) throw new ApiError(404, 'Product not in cart');
    cart.items.slice(index, 1);
    cart.save();
    return res.status(200).json(new Response(200, {}, 'Product removed from cart'));
  } catch (error) {
    next(error);
  }
};

export const reduceProductQuantity = async (req, res, next) => {
  try {
    const { productname } = req.params;
    if (!productname) throw new ApiError(400, 'Product name is required');
    const product = await Product.findOne({ name: productname });
    if (!product) throw new ApiError(404, 'Product not available');
    const cart = await CartItem.findOne({ user: req.user?._id });
    if (!cart) throw new ApiError(404, 'Cart not available');
    let index = cart.items.findIndex((item) => item.product.toString() === product._id.toString());

    if (index === -1) throw new ApiError(404, 'Product not in cart');
    if (cart.items[index]['quantity'] > 1) cart.items[index]['quantity'] -= 1;
    else cart.items.splice(index, 1);
    cart.save();
    return res.status(200).json(new Response(200, {}, 'Quantity reduced successfully'));
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    if (!userId) throw new ApiError(401, 'Unauthenticated access');
    const cart = await CartItem.findOne({ user: userId });
    if (!cart) throw new ApiError(404, 'No cart available');
    cart.items = [];
    cart.save();
    return res.status(200).json(new Response(200, {}, 'Cart removed successfully'));
  } catch (error) {
    next(error);
  }
};

export const orderItem = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    if (!userId) throw new ApiError(401, 'Unauthenticated access');
    const cart = await CartItem.findOne({ user: userId }).populate('items.product');
    if (!cart || !cart.items.length) throw new ApiError(400, 'Cart is empty');
    let totalAmount = 0;
    cart.items.forEach((item) => {
      totalAmount += item.product.finalPrice * item.quantity;
    });
    const order = new Order({
      user_id: userId,
      total_amount: totalAmount,
      status: 'Placed',
    });
    await order.save();
    const orderItems = cart.items.map((item) => ({
      order: order._id,
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.finalPrice,
    }));
    await OrderItem.insertMany(orderItems);
    await cartItem.findByIdAndDelete({ user: userId });

    return res
      .status(200)
      .json(new Response(200, { orderId: order._id }, 'Order placed successfully'));
  } catch (error) {
    next(error);
  }
};

export const getUserOrders = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    if (!userId) throw new ApiError(401, 'Unauthenticated Access');
    const orders = await Order.find({ user_id: userId }).sort({ createdAt: -1 });

    const OrdersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await OrderItem.find({ order: order._id }).populate('product', '-__v');
        return {
          orderId: order._id,
          status: order.status,
          totalAmount: order.total_amount,
          createdAt: order.createdAt,
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

export const cancelOrder = async (req, res, next) => {
  try {
    const { userId } = req.user?._id;
    const { orderId } = req.params;
    if (!userId) throw new ApiError(401, 'Unauthenticated Access');
    if (!orderId) throw new ApiError(400, 'Order id is required');
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        $set: { status: 'cancelled' },
      },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!order) throw new ApiError(404, 'Order not found');
    return res.status(200).json(new Response(200, order, 'Order cancelled successfully'));
  } catch (error) {
    next(error);
  }
};
