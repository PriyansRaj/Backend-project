import { Router } from 'express';
import {
  addItemToCart,
  changePassword,
  clearCart,
  deleteAccount,
  login,
  logout,
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
router.route('/login').post(login);
router.route('/logout').post(logout);
router.route('/refreshAccessToken').get(refreshAccessToken);
router.route('/deleteUser').delete(authenticate, deleteAccount);

router.route('/updateAvatar').patch(authenticate, upload.single('avatar'), updateAvatar);
router.route('/updateDetails').patch(updateDetails);
router.route('/changePassword').patch(authenticate, changePassword);

router.route('/addItemToCart/:productName').post(authenticate, addItemToCart);
router.route('/removeItemFromCart/:productName').delete(authenticate, removeItemFromCart);
router.route('/reduceProductQuantity/:productName').patch(authenticate, reduceProductQuantity);
router.route('/clearCart').delete(authenticate, clearCart);
export default router;
