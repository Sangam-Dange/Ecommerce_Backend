const express = require("express");
const router = express.Router();
const {
  newOrder,
  getSingleOrder,
  myOrders,
  allOrders,
  updateOrder,
  deleteOrder,
} = require("../controllers/orderController");
const { isAuthenticated, authorizeRole } = require("../middleware/auth");

router.route("/order/new").post(isAuthenticated, newOrder);

router.route("/order/:id").get(isAuthenticated, getSingleOrder);

router.route("/orders/me").get(isAuthenticated, myOrders);

router
  .route("/admin/orders")
  .get(isAuthenticated, authorizeRole("admin"), allOrders);
router
  .route("/admin/order/:id")
  .put(isAuthenticated, authorizeRole("admin"), updateOrder)
  .delete(isAuthenticated, authorizeRole("admin"), deleteOrder);

module.exports = router;
