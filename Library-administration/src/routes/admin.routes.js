import { Router } from "express";
import {
  getAllUser,
  removeUser,
  updateRole,
  getAllBooks,
  toggleUserStatus,
  getUserByUsername,
  getActiveUsers,
  adminPasswordReset,
  getUserStats
} from "../controllers/admin.controller.js";

import {
  verifyJWT,
  authorizedRoles
} from "../middlewares/authenticate.middleware.js";

const router = Router();

const adminMiddleware = [verifyJWT, authorizedRoles(["Admin"])];


router
  .route("/users")
  .get(...adminMiddleware, getAllUser)      
  .delete(...adminMiddleware, removeUser);   

router
  .route("/users/role")
  .patch(...adminMiddleware, updateRole);    

router
  .route("/users/status")
  .patch(...adminMiddleware, toggleUserStatus); 

router
  .route("/users/:username")
  .get(...adminMiddleware, getUserByUsername); 

router
  .route("/users/active")
  .get(...adminMiddleware, getActiveUsers);   

router
  .route("/users/stats")
  .get(...adminMiddleware, getUserStats);      

router
  .route("/users/password-reset")
  .patch(...adminMiddleware, adminPasswordReset); 


router
  .route("/books")
  .get(...adminMiddleware, getAllBooks);     

export default router;
