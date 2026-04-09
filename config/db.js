const mongoose=require('mongoose');
const connectDB=async ()=>{
    try{
        const conn= await mongoose.connect(`${process.env.MONGODB_URL}`);
        console.log("Connected to DB successfully");
    }catch(err){
        console.log(err.message);
        process.exit(1);// agar baar baar exit aa rha hai to vo cheez pehli baar me hi exit ho jaye 
    }
}
module.exports=connectDB;