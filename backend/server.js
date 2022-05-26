const app = require("./app");

const dotenv = require("dotenv");
const connectDB = require("./config/database");

//handling uncaught exception
process.on("uncaughtException", (err) => {
  console.log(`Error : ${err.message}`);
  console.log(`Shutting Down The Server due to uncaughtException`);
  process.exit(1);
  
});



//Config
dotenv.config({ path: "./config/config.env" });

//connecting to DB

connectDB();

const server = app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});



//unhandled promise refection
process.on("unhandledRejection", (err) => {
  console.log(`Error : ${err.message}`);
  console.log(`Shutting Down The Server due to unhandled rejection`);
  server.close(() => {
    process.exit(1);
  });
});
