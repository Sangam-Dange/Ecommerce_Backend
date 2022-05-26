const express = require("express");
const { isAuthenticated, authorizeRole } = require("../middleware/auth");
const router = express.Router();
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductDetails,
  createProductReview,
  getProductReviews,
  deleteReview,
} = require("../controllers/productController");

//here isAuthenticated function allows all people who are logged in i.e user and admin
//but it doesn't confirms that the logged in person is user or admin
//so for that we have created authorizeRole("admin") it allows only admins to make changes;
//in ecommerce only admin can create update or delete their product

//to get data
router.route("/products").get(getAllProducts);

//to add new product
router
  .route("/admin/product/new")
  .post(isAuthenticated, authorizeRole("admin"), createProduct);

//to update product
router
  .route("/admin/product/:id")
  .put(isAuthenticated, authorizeRole("admin"), updateProduct)
  .delete(isAuthenticated, authorizeRole("admin"), deleteProduct);

router.route("/product/:id").get(getProductDetails);
router.route("/review").put(isAuthenticated, createProductReview);
router
  .route("/reviews")
  .get(getProductReviews)
  .delete(isAuthenticated, deleteReview);

module.exports = router;
