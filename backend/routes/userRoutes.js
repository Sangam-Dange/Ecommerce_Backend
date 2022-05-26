const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
  getUserDetails,
  updatePassword,
  updateProfile,
  getAllUsers,
  getSingleUsersDetails,
  updateUsersRole,
  deleteUser,
} = require("../controllers/userController");
const { isAuthenticated, authorizeRole } = require("../middleware/auth");
const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/password/forgot").post(forgotPassword);
router.route("/password/reset/:token").put(resetPassword);
router.route("/logout").get(logoutUser);
router.route("/me").get(isAuthenticated, getUserDetails);
router.route("/password/update").put(isAuthenticated, updatePassword);
router.route("/me/updateprofile").put(isAuthenticated, updateProfile);
router
  .route("/admin/users")
  .get(isAuthenticated, authorizeRole("admin"), getAllUsers);
router
  .route("/admin/user/:id")
  .get(isAuthenticated, authorizeRole("admin"), getSingleUsersDetails)
  .put(isAuthenticated, authorizeRole("admin"), updateUsersRole)
  .delete(isAuthenticated, authorizeRole("admin"), deleteUser);
module.exports = router;
