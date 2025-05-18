const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/UserModel");
const isAuthenticated = require("../middlewares/isAuthenticated");

//register page logic
router.post("/register", async (req, res, next) => {
  try {
    //check if user already exists
    const existUser = await User.findOne({ email: req.body.email });
    if (existUser) {
      return res.status(201).json({ status:false,message: "User already exist",data:null });
    }
    let isadmin=req.body.isAdmin
    if(!isadmin){
        isadmin=false
    }

    //register the user
    const newUser = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      isAdmin:isadmin
    });

    if (newUser) {
      return res.status(201).json({
        status: true,
        message: "Successfully Registered",
        data: null,
      });
    }
    res.status(201).json({ status:false,message: "Something Went Wrong. Please try again later",data:null });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, message: error.message, data: null });
  }
});

//loginpage logic
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    //check empty fields
    if (!req.body || !email || !password) {
      return res
        .status(201)
        .json({ status:false,message: "Please enter email or password first",data:null });
    }
    const userFound = await User.findOne({ email });
    if (userFound && (await bcrypt.compare(password, userFound.password))) {
      const token = jwt.sign(
        {
          id: userFound._id,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "3d",
        }
      );
      res.status(201).json({ status:true,message: "Successfully Login!", data:{
        token,
        _id:userFound._id,
        username:userFound.username,
        email:userFound.email,
        isAdmin:userFound.isAdmin,
      } 
      });
    } else {
      res.status(201).json({status:false, message: "User not found",data:null });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, message: error.message, data: null });
  }
});

router.get("/logout", (req, res, next) => {
  res.clearCookie("token");
  res.json({ status: true, message: "Successfully logout" });
});



module.exports = router;
