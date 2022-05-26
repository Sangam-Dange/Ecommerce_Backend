const UserModel = require("../models/userModels");
const ErrorHandler = require("../utils/errorHandler");
const appTryCatch = require("../middleware/catchAsyncErrors");
const sendToken = require("../utils/jwToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const { findOne } = require("../models/userModels");

//Registering a user
exports.registerUser = appTryCatch(async (req, res, next) => {
  const { name, email, password } = req.body;
  const user = await UserModel.create({
    name,
    email,
    password,
    avatar: {
      public_id: "this is a sample id",
      url: "profile pic url",
    },
  });

  //longway
  //   const userToken = user.getJWToken();
  //   res.status(201).json({
  //     success: true,
  //     token: userToken,
  //   });

  //shortway
  sendToken(user, 201, res);
});

//------------------------------------------------------------------------
//login user
exports.loginUser = appTryCatch(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Please Enter Email & Password", 400));
  }

  const user = await UserModel.findOne({ email }).select("+password");
  //we have not directly passed password into find one method because we have done select false in
  //userSchema  it means fondOne method will not search for pass in collection so we need to pass password inside select method

  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  //longway
  //   const token = user.getJWToken();
  //   res.status(200).json({
  //     success: true,
  //     token,
  //   });
  //shortway
  sendToken(user, 200, res);
});

//-------------------------------------------------------------------------
//logout user

exports.logoutUser = appTryCatch(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

//-------------------------------------------------------------------------
//forgot password

exports.forgotPassword = appTryCatch(async (req, res, next) => {
  const user = await UserModel.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("user not found ", 404));
  }

  //get ResetPassword Token
  const resetToken = await user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;

  const message = `Your password reset token is : \n\n ${resetPasswordUrl} 
  \n\nIf you have not requested for this email then, please ignore it `;

  try {
    await sendEmail({
      email: user.email,
      subject: `Email Password Recovery`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
});

//reset password
exports.resetPassword = appTryCatch(async (req, res, next) => {
  //creating token hash
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await UserModel.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler(
        "Reset Password token isn't valid or has been expires",
        400
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password doesn't match", 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  //after reseting pass we are sending again token so that user gets logged in
  sendToken(user, 200, res);
});

//get userDetails

exports.getUserDetails = appTryCatch(async (req, res, next) => {
  const user = await UserModel.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

//update user password
exports.updatePassword = appTryCatch(async (req, res, next) => {
  const user = await UserModel.findById(req.user.id).select("+password");

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHandler(" Old password is Incorrect", 401));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password doesn't match", 400));
  }

  user.password = req.body.newPassword;

  await user.save();

  sendToken(user, 200, res);
});

//update user profile
exports.updateProfile = appTryCatch(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };
  //we will add cloudinary later for avatar

  const user = await UserModel.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    user,
  });
});

//get all users --admin

exports.getAllUsers = appTryCatch(async (req, res, next) => {
  const allUsers = await UserModel.find();

  res.status(200).json({
    success: true,
    allUsers,
  });
});

//get single user --admin

exports.getSingleUsersDetails = appTryCatch(async (req, res, next) => {
  
  const singleUser = await UserModel.findById(req.params.id);

  if (!singleUser) {
    return next(
      new ErrorHandler(` No user Found of id : ${req.params.id}`, 401)
    );
  }

  res.status(200).json({
    success: true,
    singleUser,
  });
});

//to change users role  ---admin

exports.updateUsersRole = appTryCatch(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  const user = await UserModel.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  if (!user) {
    return next(
      new ErrorHandler(` No user Found of id : ${req.params.id}`, 401)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

//Delete User --admin
exports.deleteUser = appTryCatch(async (req, res, next) => {
  const user = await UserModel.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(` No user Found of id : ${req.params.id}`, 401)
    );
  }

  res.status(200).json({
    success: true, 
    message: "User Deleted SuccessFully",
  });
});


