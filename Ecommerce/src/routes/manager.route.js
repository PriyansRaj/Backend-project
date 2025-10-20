import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware.js';
import {
  changeOrderStatus,
  changeRole,
  deactiveUser,
  getAllUser,
  getUser,
  getUserOrderHistory,
  reactivateUser,
  removeUser,
} from '../controllers/manager.controller.js';
import {
  addProduct,
  getAllProduct,
  getAllProductByCategory,
  getProduct,
  removeProduct,
  updateProduct,
  updateProductImage,
} from '../controllers/worker.controller.js';

const router = Router();

const managerMiddleware = [authenticate, authorizeRoles('manager')];
router.route('/changeRole').patch(...managerMiddleware, changeRole);
router.route('/removeUser').delete(...managerMiddleware, removeUser);
router.route('/getUser/:phoneOrEmail').get(authorizeRoles('manager'), getUser);
router.route('/getAllUser').get(authorizeRoles('manager'), getAllUser);
router.route('/deactivateUser/:phoneOrEmail').patch(...managerMiddleware, deactiveUser);
router.route('/reactivateUser/:phoneOrEmail').patch(...managerMiddleware, reactivateUser);

const staffMiddleWare = [authenticate, authorizeRoles('manager', 'worker')];

router.route('/product/add').post(...staffMiddleWare, addProduct);
router.route('/product/update/:name').patch(...staffMiddleWare, updateProduct);
router.route('/product/updateImage').patch(...staffMiddleWare, updateProductImage);
router.route('/product/remove').delete(...staffMiddleWare, removeProduct);
router.route('/product/get/:name').get(...staffMiddleWare, getProduct);
router.route('/product/getByCategory/:category').get(...staffMiddleWare, getAllProductByCategory);
router.route('/product/getAll').get(...staffMiddleWare, getAllProduct);

router.route('/order/update/status').patch(...staffMiddleWare, changeOrderStatus);
router.route('/order/user/history').get(...staffMiddleWare, getUserOrderHistory);
