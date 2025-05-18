require("dotenv").config();
var mongoose = require("mongoose");
var pool = () => {
  mongoose.Promise = global.Promise;

  mongoose.connect(process.env.MONGODB_URL);

  mongoose.connection
    .once("open", () => console.log("MongoDb Running"))
    .on("error", (err) => console.log(err));
};

module.exports = pool;
