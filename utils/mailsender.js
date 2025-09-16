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
            from : 'Varun Malewar',
            to :`${email}`,
            subject : `${title}`,
            html : `${body}`,


         })
         console.log("INFO",info)
         return info;

    }
    catch(err){
        console.log(err);
    
    }
}
module.exports = mailsender;