import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware.js';
import {
  changeRole,
  deactiveUser,
  getAllUser,
  getUser,
  reactivateUser,
  removeUser,
} from '../controllers/manager.controller.js';
const router = Router();

router.route('/changeRole').patch(authenticate, authorizeRoles('manager'), changeRole);
router.route('/removeUser').delete(authenticate, authorizeRoles('manager'), removeUser);
router.route('/getUser').get(authorizeRoles('manager'), getUser);
router.route('/getAllUser').get(authorizeRoles('manager'), getAllUser);
router.route('/deactivateUser').patch(authenticate, authorizeRoles('manager'), deactiveUser);
router.route('/reactivateUser').patch(authenticate, authorizeRoles('manager'), reactivateUser);
