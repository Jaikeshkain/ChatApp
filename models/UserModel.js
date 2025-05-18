const mongoose=require("mongoose")
const bcrypt=require("bcryptjs")

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin:{
    type:Boolean,
    default:false
  },
  groups:[
    { type:mongoose.Schema.Types.ObjectId,
      ref:"Group"
    }
  ]
},{
    timestamps:true
});

//!Hash the user password before saving
userSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        return next()
    }
    this.password=await bcrypt.hash(this.password,10)
})

const User=mongoose.model("User",userSchema);
module.exports=User