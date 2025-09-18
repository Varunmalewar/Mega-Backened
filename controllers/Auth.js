const User = require('../models/User');
const OTP = require('../models/OTP');
// const { generate } = require('otp-generator');
const otpGenerator = require('otp-generator');
const Profile = require('../models/Profile');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mailsender = require('../utils/mailsender');
require('dotenv').config();






//send otp

exports.sendOTP = async (req,res)=>{

    try{
        
    // step1 :- fetch email from user ki body
    const {email} = req.body


    //check if user already exist
    const checkUserPresent = await User.findOne({email});

    // if already exist then simply return 
    if(checkUserPresent){
        return res.status(401).json({
            success : false,
            message : "User already exist"

        })
    }
    // generate otp
    var otp = otpGenerator.generate(6,{
        upperCaseAlphabets : false,
        lowerCaseAlphabets : false,
        specialChars : false
    
    })
    console.log("OTP gnerated succesfully")

    //make sure otp generated is unique
    let result = await OTP.findOne({otp: otp})

    while(result){    // jab tak mujhe collection mein se otp mil rahi hai same same tab tak naya otp generate karin
        otp = otpGenerator(6,{
         upperCaseAlphabets : false,
        lowerCaseAlphabets : false,
        specialChars : false
        });

        result = await OTP.findOne({otp: otp})

    }


    //otp ki entry db mein karni hai 
    const otpPayload = {email , otp};
    const otpBody = await OTP.create(otpPayload)
    console.log(otpBody)

    //return response 
    res.status(200).json({
        success : true,
        message : "OTP sent successfully",
        otp : otp
    })


    }
    catch(err){
        console.log(err);
        res.status(500).json({
            success : false,
            message : err.message
        })
    }

}



//signup
exports.signup = async (req, res)=>{
      

    try{
        // data fetch from user ki body 
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;

        //validate krlo

        if(!firstName || !lastName || !email || !password || !confirmPassword ||!otp){
            return res.status(400).json({
                success : false,
                message : "All fields are required"
            })

        }

        //2 password ko match karo 
        if(password !== confirmPassword){
            return res.status(400).json({
                success : false,
                message : "Password and confirm password do not match . Fir se password daal chhote"
            })}

        // check user already exist or not 

        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success : false,
                message : "User already exist"
            })
        }

        //find the most recent OTP stores for the user 
        const recentOTP = await OTP.find({email}).sort({createdAt : -1}).limit(1);
        console.log(recentOTP);



        //validate otp
        if(recentOTP.length == 0){
            return res.status(400).json({
                success : false,
                message : "OTP not found"
            }) 

        }else if(otp !== recentOTP[0].otp){
            return res.status(400).json({
                success : false,
                message : "Invalid OTP"
            })
        } 


        //hash password 
        const hashedPassword = await bcrypt.hash(password, 10);

        // entry created in db 
        const profileDetails = await Profile.create({
            gender : null,
            dateofbirth : null,
            about : null,
            contactNumber : null
        })


        const user = await User.create({
            firstName,
            lastName,
            email,
            password : hashedPassword,
            accountType,
            additionalDetails : profileDetails._id,
            image: `https://api.dicebear.com/9.x/initials/svg?seed=${firstName} ${lastName}`
    
        
        })

        //return res
        res.status(201).json({
            success : true,
            message : "User created successfully",
            user
        })
        
    }catch(err){
        console.log(err);
        res.status(500).json({
            success : false,
            message : "User is not created ",err
        })
    }
    
    
    
    
    
    
    
    
}

//login

exports.login= async(req,res)=>{
    try{
        //get data from rq.body
        const {email,password} = req.body
        //validation
        if(!email || !password){
            return res.status(403).json({
                success : false,
                message : "All fields are required"
            })
        }
        //user check exist or not 
        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.status(404).json({
                success : false,
                message : "User not found"
            })}
        //generate jwt token , after matching password matching 
        if(await bcrypt.compare(password,user.password)){
            const payload = {
                email : user.email,
                id : user._id,
                accountType : user.accountType
            }
            const token  = jwt.sign(payload, process.env.JWT_SECRET,{
                expiresIn : "2h"
            
            }
        

                  
            )
            user.token = token;
            user.password = undefined;
            
            
            // create cookie and send response 
            const options = {
                expires : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly : true
            }
            
            res.cookie("token", token, options).status(200).json({
                success : true,
                token,
                user,
                message : "Logged in successfully"
                
                
            })
        }
        else{
            return res.status(400).json({
                success : false,
                message : "Password is incorrect  "
            })
        }
        


        
    } 
    catch(err){
        console.log(err);
        return res.status(500).json({
            success : false,
            message : "Login failed ",err
        })



    }
}

//change password

exports.changePassword = async(req,res)=>{
    try{
        //get data from req.body
        const {oldPassword,newPassword,confirmPassword} = req.body;
        //validation
        if(!oldPassword || !newPassword || !confirmPassword){
            return res.status(400).json({
                success : false,
                message : "All fields are required"
            })
        }
        // find user
        const user = await User.findById(req.user.id);
        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }
        // check old password
        if(!(await bcrypt.compare(oldPassword, user.password))){
            return res.status(400).json({
                success: false,
                message: "Old password is incorrect"
            })
        }
        // check new passwords match
        if(newPassword !== confirmPassword){
            return res.status(400).json({
                success: false,
                message: "Password and confirm password do not match"
            })
        }
        // hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        // update password
        user.password = hashedPassword;
        await user.save();
        // send mail
        await mailsender(user.email, "Password Updated", "<p>Your password has been successfully updated.</p>");
        // return response
        return res.status(200).json({
            success: true,
            message: "Password changed successfully"
        })
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "Failed to change password"
        })
    }
}
