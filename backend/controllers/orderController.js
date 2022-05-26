const OrderModel = require("../models/orderModel");
const ProductModel = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const appTryCatch = require("../middleware/catchAsyncErrors");

//creating a new order
exports.newOrder = appTryCatch(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  const order = await OrderModel.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt: Date.now(),
    user: req.user._id,
  });

  res.status(201).json({
    success: true,
    order,
  });
});

//get Single order

exports.getSingleOrder = appTryCatch(async (req, res, next) => {
  const singleOrder = await OrderModel.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!singleOrder) {
    return next(
      new ErrorHandler(`Order of id ${req.params.id} not found`, 404)
    );
  }

  res.status(200).json({
    success: true,
    singleOrder,
  });
});

//get logged in user order
exports.myOrders = appTryCatch(async (req, res, next) => {
  const orders = await OrderModel.find({ user: req.user._id });

  res.status(200).json({
    success: true,
    orders,
  });
});

//get all orders --admin
exports.allOrders = appTryCatch(async (req, res, next) => {
  const allOrders = await OrderModel.find();

  let totalAmount = 0;

  allOrders.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  res.status(200).json({
    success: true,
    totalAmount,
    allOrders,
  });
});

//update order status --admin
exports.updateOrder = appTryCatch(async (req, res, next) => {
  const order = await OrderModel.findById(req.params.id);
   
  if (!order) {
    return next(
      new ErrorHandler(`Order of id ${req.params.id} not found`, 404)
    );
  }


  if (order.orderStatus === "Delivered") {
    return next(
      new ErrorHandler(" Your have already delivered this order ", 400)
    );
  }

  //updating stock of  a product
  // if (req.body.status === "Shipped") {
    order.orderItems.forEach(async (o) => {
      await updateStock(o.product, o.quantity);
    });
  // }

  order.orderStatus = req.body.status;

  if (req.body.status === "Delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });


  res.status(200).json({
    success: true,
  });
});

async function updateStock(id, quantity) {
  const product = await ProductModel.findById(id);
  // product.Stock = product.Stock - quantity;
  product.Stock -= quantity;

  await product.save({ validateBeforeSave: false });
}

//deleting order --admin
exports.deleteOrder = appTryCatch(async (req, res, next) => {
  const order = await OrderModel.findById(req.params.id);

  if (!order) {
    return next(
      new ErrorHandler(`Order of id ${req.params.id} not found`, 404)
    );
  }

  await order.remove();

  res.status(200).json({
    success: true,
  });
});
