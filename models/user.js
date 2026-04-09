const mongoose=require('mongoose');
const userschema=mongoose.Schema({
    name:{
        type:String,
        required:true
    },email:{
        type:String,
        required:true,
        unique:true
    },password:{
        type:String,
        required:true
    },
    isVerified: {
        type: Boolean,
    default: false
    },
    verificationToken: {
        type: String
    },
    verificationTokenExpiry: {
        type: Date
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordTokenExpiry: {
        type: Date
    }
},{
    timestamps:true
})
const user=mongoose.model("User",userschema);
module.exports=user;