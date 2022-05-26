const ProductModel = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const appTryCatch = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apiFeatures");

//-------------------------------------------------------------------------------
//create products --admin
exports.createProduct = appTryCatch(async (req, res, next) => {
  req.body.user = req.user._id;

  const product = await ProductModel.create(req.body);

  res.status(201).json({
    success: true,
    newProduct: product,
  });
});

//-------------------------------------------------------------------------------
//to update product --admin
exports.updateProduct = appTryCatch(async (req, res, next) => {
  let productId = req.params.id;

  let productOfPerId = await ProductModel.findById(productId);

  if (!productOfPerId) {
    // return res.status(500).json({
    //   success: false,
    //   message: "Product not found",
    // });

    return next(new ErrorHandler("Product not Found", 404));
  }

  productOfPerId = await ProductModel.findByIdAndUpdate(productId, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    updatedProduct: productOfPerId,
  });
});

//-------------------------------------------------------------------------------
//delete product --admin
exports.deleteProduct = appTryCatch(async (req, res, next) => {
  let productId = req.params.id;

  let product = await ProductModel.findById(productId);
  if (!product) {
    // return res.status(500).json({
    //   success: false,
    //   message: "Product not found",
    // });

    return next(new ErrorHandler("Product not Found", 404));
  }

  await product.remove();

  res.status(200).json({
    success: true,
    message: "Product Deleted Successfully",
  });
});

//-------------------------------------------------------------------------------
//get single product i.e product details
exports.getProductDetails = appTryCatch(async (req, res, next) => {
  let productId = req.params.id;

  let product = await ProductModel.findById(productId);

  if (!product) {
    // return res.status(500).json({
    //   success: false,
    //   message: "Product not found",
    // });

    return next(new ErrorHandler("Product not Found", 404));
  }

  res.status(200).json({
    success: true,
    productDetail: product,
  });
});

//-------------------------------------------------------------------------------
//get all products
exports.getAllProducts = appTryCatch(async (req, res) => {
  //search functionality
  let resultPerPage = 5;

  const apiFeature = new ApiFeatures(ProductModel.find(), req.query)
    .search()
    .filter()
    .pagination(resultPerPage);

  const allProducts = await apiFeature.query;

  res.status(200).json({
    success: true,
    length: allProducts.length,
    allProducts: allProducts,
  });
});

//create a review or update the review

exports.createProductReview = appTryCatch(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await ProductModel.findById(productId);
  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );
  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString()) {
        (rev.rating = rating), (rev.comment = comment);
      }
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  //overall rating

  let avg = 0;
  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });
  product.ratings = Number(avg / product.reviews.length);

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});



// Get All Reviews of a product
exports.getProductReviews = appTryCatch(async (req, res, next) => {
  const product = await ProductModel.findById(req.query.id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});
 

exports.deleteReview = appTryCatch(async (req, res, next) => {
  
  const product = await ProductModel.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  let avg = 0;

  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  let ratings = 0;

  if (reviews.length === 0) {
    ratings = 0;
  } else {
    ratings = avg / reviews.length;
  }

  const numOfReviews = reviews.length;

  await ProductModel.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
});