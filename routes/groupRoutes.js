const express = require("express");
const Group = require("../models/GroupModel");
const isAuthenticated = require("../middlewares/isAuthenticated");
const User = require("../models/UserModel");
const isAdmin = require("../middlewares/isAdmin");
const router = express.Router();

//create group logic
router.post("/creategroup",isAuthenticated,isAdmin, async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const group = await Group.create({
      name,
      description,
      admin: req.user._id,
      members: [req.user._id],
    });
    if (!group) {
      return res.status(201).json({ status:false,message: "Failed to create group",data:null });
    } else {
      //add group to userModel
      const updateAdminUser = await User.findByIdAndUpdate(
        req.user._id,
        {
          groups: [group._id],
        },
        { new: true }
      );
      res
        .status(201)
        .json({ status: true, message: "successfully created!", data: null });
    }
  } catch (error) {
    res.status(500).json({ status: false, message: error.message,data:null });
  }
});

//fetch all group
router.get("/",async (req,res,next)=>{
    try {
        const group = await Group.find().populate("members","username email").populate("admin","username email")
        if(!group){
            return res.status(201).json({status:false,message:"No Group Found",data:null})
        }else{
            res.status(201).json({ status: true, message: "Found", data:group });
        }
    } catch (error) {
        res
          .status(500)
          .json({ status: false, message: "Error", error: error.message,data:null });
    }
})

//join the group
router.post("/:groupId/join",isAuthenticated,async (req,res,next)=>{
    try {
        const group=await Group.findById(req.params.groupId)
        if(!group){
            return res.status(204).json({status:false,message:"Group Not Found",data:null})
        }
        if(group && group.members.includes(req.user._id)){
            return res.status(201).json({status:false,message:"Group already join",data:null})
        }
        group.members.push(req.user._id)
        await group.save()
        res
          .status(201)
          .json({ status: true, message: "Successfully joined the group",data:null });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message,data:null });
    }
})

//leave group
router.post("/:groupId/leave",isAuthenticated,async (req,res,next)=>{
    try {
        const group=await Group.findById(req.params.groupId)
        if (!group) {
          return res.status(202).json({ status:false,data:null,message: "Group Not Found" });
        }
        if(group && !group.members.includes(req.user._id)){
            return res.status(202).json({status:false,data:null,message:"Already leaved"})
        }
        group.members.pop(req.user._id)
        await group.save()
        res.status(201).json({status:true,data:null,message:"Successfully Leaved the group"})
    } catch (error) {
        res.status(500).json({status:false,data:null,message:error.message})
    }
})

// //users group
// router.get("/user", isAuthenticated, async (req, res, next) => {
//   try {
//     const usersGroup = await Group.find({members:req.user._id}).populate("members","username email isAdmin").populate("admin","username email isAdmin")
//     if(!usersGroup){
//       return res.status(201).json({status:false,message:"No Group Found",data:null})
//     }
//     res.status(201).json({status:true,message:"Group Found",data:usersGroup})
//   } catch (error) {
//     res.status(500).json({status:false,message:error.message,data:null})
//   }
// });

module.exports = router;
