const nodemailer = require('nodemailer');

const mailsender = async (email , title , body)=>{
    try{
        let transporter = nodemailer.createTransport({
            host : process.env.MAIL_HOST,
            auth:{
                user : process.env.MAIL_USER,
                pass : process.env.MAIL_PASS
            }

         })
         let info = await transporter.sendMail({
            
         })

    }
    catch(err){
        console.log(err);
    
    }
}
module.exports = mailsender;