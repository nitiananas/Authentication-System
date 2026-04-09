const express=require('express');
const app=express();
const dotenv=require('dotenv')
dotenv.config();
const authroutes=require('./routes/auth.routes');
const connectdb=require('./config/db')
connectdb();
const cookieparser=require('cookie-parser');

app.use(cookieparser());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use('/auth',authroutes)
app.get('/',function(req,res){
    res.send("hey from server");
});
app.listen(3000,()=>{
    console.log("server is started on port 3000");
})
