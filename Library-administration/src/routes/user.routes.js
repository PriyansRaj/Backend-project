import { Router } from "express";
import {
  signUp,
  login,
  logoutUser,
  getCurrentUser,
  changePassword,
  updateDetails,
  refreshAccessToken,
  deleteAccount
} from "../controllers/User.controller.js";

import { verifyJWT } from "../middlewares/authenticate.middleware.js";

const router = Router();


router
  .route("/signup")
  .post(signUp); 

router
  .route("/login")
  .post(login); 
router
  .route("/logout")
  .post(verifyJWT, logoutUser); 

router
  .route("/refresh-token")
  .get(refreshAccessToken);



router
  .route("/current-user")
  .get(verifyJWT, getCurrentUser)       
  .delete(verifyJWT, deleteAccount);    

router
  .route("/update")
  .patch(verifyJWT, updateDetails);    

router
  .route("/change-password")
  .post(verifyJWT, changePassword);     

router
  .route("/deleteAccount")
  .delete(verifyJWT,deleteAccount)
export default router;
