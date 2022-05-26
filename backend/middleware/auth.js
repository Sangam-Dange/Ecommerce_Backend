//only authenticated means logedIn user can access specific things
//like create product etc
const ErrorHandler = require("../utils/errorHandler");
const appTryCatch = require("./catchAsyncErrors");
const jwToken = require("jsonwebtoken");
const userModels = require("../models/userModels");

exports.isAuthenticated = appTryCatch(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler("Please login to access this resource", 401));
  }

  const decodeData = jwToken.verify(token, process.env.JWT_SECRET);
  // console.log(decodeData);
  req.user = await userModels.findById(decodeData.id);
  // console.log(req.user);
  next();
});

exports.authorizeRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role : ${req.user.role} is not allowed to access this resource`,
          403
        )
      );
    }

    next();
  };
};
