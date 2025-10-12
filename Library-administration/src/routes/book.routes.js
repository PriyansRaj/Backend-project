import express from "express";
import {
  createBook,
  deleteBook,
  updateBook,
  getBookByTitle,
  borrowedHistoryByTitle,
  borrowBook,
  returnBook,
  getUserRecord,
  getAllBorrowedBooks,
  booksAvailability,
  bookIsAvailable,
  getAllBooks,
} from "../controllers/book.controller.js";
import { verifyJWT } from "../middlewares/authenticate.middleware.js";
import { authorizedRoles } from "../middlewares/authorize.middleware.js";

const router = express.Router();
router
  .route("/")
  .post(verifyJWT, authorizedRoles("admin"), createBook) 
  .get(verifyJWT, authorizedRoles("admin"), getAllBooks); 
router
  .route("/:title")
  .get(verifyJWT, getBookByTitle) 
  .put(verifyJWT, authorizedRoles("admin"), updateBook) 
  .delete(verifyJWT, authorizedRoles("admin"), deleteBook);

router
  .route("/borrow")
  .post(verifyJWT, authorizedRoles("user", "admin"), borrowBook);

router
  .route("/return")
  .post(verifyJWT, authorizedRoles("user", "admin"), returnBook); 


router
  .route("/history/:title")
  .get(verifyJWT, authorizedRoles("admin"), borrowedHistoryByTitle); 

router
  .route("/user/:username")
  .get(verifyJWT, authorizedRoles("admin", "user"), getUserRecord); 

router
  .route("/borrowed/all")
  .get(verifyJWT, authorizedRoles("admin"), getAllBorrowedBooks);


router
  .route("/availability")
  .get(verifyJWT, authorizedRoles("admin", "user"), booksAvailability); 

router
  .route("/available/:title")
  .get(verifyJWT, authorizedRoles("admin", "user"), bookIsAvailable); 

export default router;
