const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");

const isAuthenticated = async (req, res, next) => {
  //get the token the user is passing
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");
      console.log(req.user);

      next();
    } catch (error) {
      res.status(500).json({ status:false,message: "Not authorized, token failed",data:null });
    }
  }
  if (!token) {
    res.status(201).json({ status:false,message: "Not authorized, token not found",data:null });
  }
};


module.exports = isAuthenticated
