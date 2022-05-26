const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const errorMiddleware = require("./middleware/error");

//middleware
app.use(express.json());
app.use(cookieParser());

//importing routes
const orderRoutes = require("./routes/orderRoutes");
const productRoutes = require("./routes/productRoute");
const userRoutes = require("./routes/userRoutes");

app.use("/api/v1", orderRoutes);
app.use("/api/v1", productRoutes);
app.use("/api/v1", userRoutes);

//middleware for error
app.use(errorMiddleware);

module.exports = app;
