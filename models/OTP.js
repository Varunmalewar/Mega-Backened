const mongoose = require('mongoose');
const mailsender = require('../utils/mailsender');

const OTPSchema = new mongoose.Schema({
    email:{
        type : String,
        required : true
    },
    otp :{
        type : String,
        required : true
    
    },
    createdAt :{
        type : Date,
        default : Date.now,
        index : {expires : 300}  // otp expires in 5 minutes
    }
})

// function -> to send email
async function sendVerificationEmail(email, otp){  // kisko mail bheju aur kis otp ke saath bheju 
    try{
        const mailResponse = await mailsender(email,"Verification email from varun" , otp)
        console.log("Email sent successfully ", mailResponse)


    }
    catch(err){
        console.log("error occured while sending email",err)
        throw err;

    }

    

}


OTPSchema.pre("save",async function(next){
    await sendVerificationEmail(this.email,this.otp);
    next();

})

module.exports = mongoose.model('OTP',OTPSchema)