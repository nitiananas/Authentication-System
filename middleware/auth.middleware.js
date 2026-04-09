const jwt=require('jsonwebtoken');
const User=require('../models/user')

module.exports.authmiddleware=async function(req,res,next){
    try {
        const token= req.cookies.token;
        if(!token){
            return res.status(401).json({
                message:'Unauthorized'
            })
        }
        const decoded=jwt.verify(token,process.env.JWT_SECRET)
        req.user= await User.findById(decoded.id)
        next();
    } catch (err) {
        return res.status(401).json({
            message:'Unauthorized'
        })
    }
}