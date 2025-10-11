import {Router} from "express";
import { 
  changePassword, 
  getCurrentUser, 
  login, 
  logoutUser, 
  refreshAccessToken, 
  signUp, 
  updateDetails 
} from "../controllers/User.controller.js";
import {authorizedRoles, verifyJWT} from "../middlewares/authenticate.middleware.js"
import { getAllUser, removeUser, updateRole } from "../controllers/admin.controller.js";

const router = Router();

router.route("/signup").post(signUp)
router.route("/login").post(login);
router.route("/logout").post(verifyJWT,logoutUser);
router.route("/currentUser").get(verifyJWT,getCurrentUser);
router.route("/changePassword").post(verifyJWT,changePassword);
router.route("/updateDetails").patch(verifyJWT,updateDetails);
router.route("/refreshAccessToken").get(refreshAccessToken)
router.route("/getAllUsers").get(verifyJWT,authorizedRoles(['Admin']),getAllUser)
router.route("/removeUser").delete(verifyJWT,authorizedRoles(['Admin']),removeUser)
router.route("/updateRole").patch(verifyJWT,authorizedRoles(['Admin']),updateRole)
export default router;