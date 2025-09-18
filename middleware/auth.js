const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../models/User');



//auth
exports.auth = async (req, res , next )=>{
    try{
        //extract token
        const token = req.cookies.token || req.body.token || req.header("Authorization").replace("Bearer ","");

        // if token missing , then return response 
        if(!token){
            return res.status(401).json({
                success : false,
                message : "Token is missing"
            })
        }

        //verify token
        try{
            const decode = jwt.verify(token, process.env.JWT_SECRET);
            console.log(decode)
            req.user = decode;
            next()
        }
        catch(err){
            return res.status(401).json({
                success : false,
                message : "Token is invalid"
            })

        }




    }
    catch(err){
        return res.status(401).json({
            success : false,
            message : "Something went wrong while validating the token in auth.js"
        })

    }
}




//isstudent
exports.isStudent = async (req, res, next )=>{
    try{
        
       if(req.user.accountType !== "Student"){
        return res.status(401).json({
            success : false,
            message : "You are not a student"
        
        })
    }
    next();



    }
    catch(err){

        return res.status(500).json({
            success : false,
            message : "User role is not validate "
        })
    }
}


//isInstructor
exports.isInstructor = async (req, res, next )=>{
    try{
       if(req.user.accountType !== "Instructor"){
        return res.status(401).json({
            success : false,
            message : "You are not a instructor"
        
        })
    }
    next();



    }
    catch(err){

        return res.status(500).json({
            success : false,
            message : "User role is not validate "
        })
    }
}

//isAdmin
exports.isAdmin = async (req, res, next )=>{
    try{
       if(req.user.accountType !== "Admin"){
        return res.status(401).json({
            success : false,
            message : "You are not a admin"
        
        })
    }
    next();



    }
    catch(err){

        return res.status(500).json({
            success : false,
            message : "User role is not validate "
        })
    }
}