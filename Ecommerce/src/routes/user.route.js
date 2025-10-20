import { Router } from 'express';
import {
  addItemToCart,
  cancelOrder,
  changePassword,
  clearCart,
  deleteAccount,
  getUserOrders,
  githubLogin,
  googleLogin,
  login,
  logout,
  orderItem,
  reduceProductQuantity,
  refreshAccessToken,
  removeItemFromCart,
  signup,
  updateAvatar,
  updateDetails,
} from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = Router();

router.route('/signup').post(upload.single('avatar'), signup);
router.route('/login/google').get(googleLogin);
router.route('/login/google/callback').get(googleLogin);
router.route('/login/github').get(githubLogin);
router.route('/login/github/callback').get(githubLogin);
router.route('/login').post(login);
router.route('/logout').post(logout);
router.route('/refreshAccessToken').get(refreshAccessToken);
router.route('/deleteUser').delete(authenticate, deleteAccount);

router.route('/update/avatar').patch(authenticate, upload.single('avatar'), updateAvatar);
router.route('/upate/details').patch(updateDetails);
router.route('/update/password').patch(authenticate, changePassword);

router.route('/cart/add/:productName').post(authenticate, addItemToCart);
router.route('/cart/remove/:productName').delete(authenticate, removeItemFromCart);
router.route('/cart/quantityReduce/:productName').patch(authenticate, reduceProductQuantity);
router.route('/cart/clear').delete(authenticate, clearCart);

router.route('/order/cart').post(authenticate, orderItem);
router.route('/order/getAll').get(authenticate, getUserOrders);
router.route('/order/cancel').patch(authenticate, cancelOrder);
export default router;
