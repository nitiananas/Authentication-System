const express=require('express');
const { register ,login,logout,profile, verifyEmail,forgotPassword,resetPassword} = require('../controllers/authcontrollers');
const { authmiddleware } = require('../middleware/auth.middleware');
const router=express.Router();

router.post('/register',register)
router.post('/login',login)
router.post('/logout',logout)
router.post('/forgot-password',forgotPassword)
router.post('/reset-password',resetPassword)
router.get('/me',authmiddleware,profile)
router.get('/verify-email',verifyEmail)

module.exports=router;