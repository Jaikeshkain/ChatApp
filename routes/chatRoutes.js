const express=require("express");
const isAuthenticated = require("../middlewares/isAuthenticated");
const Message = require("../models/ChatModel");
const Group = require("../models/GroupModel");
const router=express.Router()

//post message
router.post("/post_message",isAuthenticated,async (req,res,next)=>{
    try {
        const {content,groupId}=req.body

        const checkJoined=await Group.findById(groupId)
        if(!checkJoined.members.includes(req.user._id)){
            return res.status(403).json({status:false,data:null,message:"Please Join the Group first"})
        }
        const message=await Message.create({
            sender:req.user._id,
            content:content,
            group:groupId
        })
        if(!message){
            return res.status(400).json({status:false,data:null,message:"does not send message"})
        }
        checkJoined.messages.push(message._id)
        checkJoined.save()
        const populateMessage=await Message.findById(message._id).populate("sender","username email").populate("group")
        res.status(201).json({status:true,data:populateMessage,message:"Success"})
    } catch (error) {
        res.status(500).json({status:false,data:null,message:error.message})
    }
});

router.get("/:groupId/fetch_all_message",isAuthenticated,async (req,res,next)=>{
    try {
        const messages=await Message.find({group:req.params.groupId}).populate("sender","username email").populate("group")
        if(!messages){
            return res.status(201).json({status:false,data:null,message:"No message found"})
        }

        res.status(201).json({status:true,data:messages,message:"Success"})
    } catch (error) {
        res.status(500).json({status:false,data:null,message:error.message})
    }
})

module.exports=router