const User = require('../models/User');
const OTP = require('../models/OTP');
const mailsender = require('../utils/mailsender');
const crypto = require('crypto');
const bcrypt = require('bcrypt');



//reset password token 
exports.resetPasswordToken = async (req,res)=>{
    try{
    //get email from req.body
    const email = req.body.email;


    //check user for this email , email validation 
    const user = await User.findOne({email});
    if(!user){
        return res.status(404).json({
            success : false,
            message : "User not found"
        })
    }
    // generate token 
    const token = crypto.randomUUID();


    //update user by adding token and expiration time 
    const updatedDetails = await User.findOneAndUpdate({email : email},
                                                    {
                                                        token : token,
                                                        resetPasswordExpires : Date.now() + 3600000
                                                    },
                                                    {
                                                        new : true
                                                    }
    )
    // create url
    const url = `http://localhost:3000/update-password/${token}`

    // send maill containg url 
    await mailsender(email, "Password reset link", `Password reset link : ${url}`);


    // return response 
    return res.json({
        success:true,
        message:"Email sent successsfully , Pleas check email and change password"
    })


    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            message : "Something went wrong while sending email"
        })
    }


    
}







//resetPassword // db mein update karne ka kaam 
exports.resetPassword = async (req, res)=>{
  try{
      //data fetch
    const {password, confirmPassword,token} = req.body;
    //validation
    if(password !== confirmPassword){
        return res.json({
            success : false,
            message : "Password and confirm password do not match"

        })
    }
    //get userdetails from db using token
    const userDetails = await User.findOne({token : token});

    
    //if no entry- invalid token 
    if(!userDetails){
        return res.json({
            success : false,
            message : "Invalid token"
        })
    }
    //token time check 
    if(userDetails.resetPasswordExpires < Date.now()){
        return res.json({
            success : false,
            message : "Token expired"
        })
    }
    //hash password 
    const hashedPassword = await bcrypt.hash(password, 10);

    //update password
    await User.findOneAndUpdate({
        token : token
    },
    {
        password : hashedPassword,
        token : "",
        resetPasswordExpires : undefined
      
      
    },
    {
        new : true
    })


    //return response 
    return res.status(200).json({
        success : true,
        message : "Password reset successfully"

    })

  }
  catch(err){
    console.log(err);
  }
}