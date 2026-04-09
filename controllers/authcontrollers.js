const bcrypt=require('bcrypt');
const User=require('../models/user')
const jwt=require('jsonwebtoken')
const crypto = require('crypto');
module.exports.register=async (req,res)=>{
    const {name ,email, password}=req.body;
    try {
        if(!name || !email || !password){
            return res.status(400).json({
                message:'All details are required'
            })
        }
        let user=await User.findOne({email});
        if(user){
            return res.status(400).json({
                message:'User already exists'
            })
        }
        const salt=await bcrypt.genSalt();
        const hashpass=await bcrypt.hash(password,salt);
        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
        const tokenExpiry = Date.now() + 10 * 60 * 1000; // 10 min
        user = await User.create({
            name,
            email,
            password: hashpass,
            verificationToken: hashedToken,
            verificationTokenExpiry: tokenExpiry
        });
        console.log(`Verify here: http://localhost:3000/auth/verify-email?token=${rawToken}`);
        const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{
            expiresIn:'2d'
        });
        res.cookie('token',token,{
            httpOnly:true,
            secure:process.env.NODE_ENV==='production',
            maxAge:30*24*60*60*1000
        })
        res.status(200).json({
            message:'User registered successfully'
        })
    } catch (err) {
        res.status(500).json({
            message:'Something went wrong',
            err
        })
    }
}
module.exports.login=async (req,res)=>{
    const {email,password}=req.body;
    try {
        if(!email || !password){
            return res.status(400).json({
                message:'All details are required'
            })
        }
        let user=await User.findOne({email});
        if(!user){
            return res.status(400).json({
                message:'User not found'
            })
        }
        if (!user.isVerified) {
            return res.status(400).json({
                message: 'Please verify your email first'
            });
        }
        let isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(400).json({
                message:'Invalid password'
            })
        }
        const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{
            expiresIn:'2d'
        });
        res.cookie('token',token,{
            httpOnly:true,
            secure:process.env.NODE_ENV==='production',
            maxAge:30*24*60*60*1000
        })
        res.status(200).json({
            message:'Login successfully',
            user
        })
    } catch (err) {
        res.status(500).json({
            message:'Something went wrong',
            err
        })
    }    
}

module.exports.logout=async (req,res)=>{
    res.cookie('token','',{
        httpOnly:true,
        expires:new Date(0),
    })
    res.status(200).json({
        message:'Logged out successfully'
    })
}
module.exports.profile=function(req,res){
    res.status(200).json({
        message:'This is Your profile',
        user:req.user
    })
}
module.exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await User.findOne({
            verificationToken: hashedToken,
            verificationTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                message: 'Invalid or expired token'
            });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiry = undefined;

        await user.save();

        res.status(200).json({
            message: 'Email verified successfully'
        });

    } catch (err) {
        res.status(500).json({
            message: 'Something went wrong',
            err
        });
    }
};
module.exports.forgotPassword=async (req,res)=>{
    const {email}=req.body;
    try {
        if(!email){
            return res.status(400).json({
                message:'Email is required'
            })
        }
        const user=await User.findOne({email});
        if(!user){
            return res.status(400).json({
                message:'User not found'
            })
        }
        const rawToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    
        user.resetPasswordToken=hashedToken;
        user.resetPasswordTokenExpiry= Date.now() + 10 * 60 * 1000;
        await user.save();
        console.log(`Reset your password here : http://localhost:3000/auth/reset-password?token=${rawToken}`);
        res.status(200).json({
            message:'Password reset link sent to your email',

        })
    } catch (err) {
        res.status(500).json({
            message:'Something went wrong',
            err
        })
    }
}
module.exports.resetPassword=async (req,res)=>{
    const {token,newpassword}=req.body;
    try {
        if(!token || !newpassword){
            return res.status(400).json({
                message:'All details are required'
            })
        }
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user=await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordTokenExpiry: { $gt: Date.now() }
        });
        if(!user){
            return res.status(400).json({
                message:'Invalid or expired token'
            })
        }
        const salt=await bcrypt.genSalt();
        const hashpass=await bcrypt.hash(newpassword,salt);
        user.password=hashpass;
        user.resetPasswordToken=undefined;
        user.resetPasswordTokenExpiry=undefined;
        await user.save();
        res.status(200).json({
            message:'Password reset successfully'
        })
    }catch(err){
        res.status(500).json({
            message:'Something went wrong',
            err
        })
    }
}