const Profile = require('../models/Profile');
const User = require('../models/User');
const Course = require('../models/Course');

exports.updateProfile = async (req,res)=>{
    try{
        //get data from req.body
        const {gender,dateofbirth="",about="",contactNumber} = req.body;



        //get user id from req.user.id
        const id = req.user.id
        //validation
        if(!gender || !dateofbirth || !about || !contactNumber){
            return res.status(400).json({
                success : false,
                message : "All fields are required"
            })
        }
        //find profile
        const userDetails = await User.findById(id)
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findByIdAndUpdate(profileId)
        //update profile
        profileDetails.gender = gender;
        profileDetails.dateofbirth = dateofbirth;
        profileDetails.about = about;
        profileDetails.contactNumber = contactNumber;
        await profileDetails.save();
        //return response
        return res.status(200).json({
            success : true,
            message : "Profile updated successfully",
            profileDetails
        })

    }
    catch(err){
        return res.status(500).json({
            success : false,
            message : err.message       
        })
    }
}

//delete account

exports.deleteAccounţ= async(req,res)=>{
    try{
        //get user id from req.user.id
        const id = req.user.id;

        //validation
        const userDetails = await User.findById(id);
        if(!userDetails){
            return res.status(404).json({
                success : false,
                message : "User not found"
            })
        }
        //delete profile 
        await Profile.findByIdAndDelete({_id: userDetails.additionalDetails});
        // TODO: hw unroll user from all enrolled courses 
         // Unenroll user from all enrolled courses
        // Assuming 'courses' is an array of course IDs in the User model
        for (const courseId of userDetails.courses) {
            await Course.findByIdAndUpdate(
                courseId,
                { $pull: { studentsEnrolled: id } },
                { new: true }
            );
        }


        //delete user 
        await User.findByIdAndDelete(id);


        // return response
        return res.status(200).json({
            success : true,
            message : "User deleted successfully"
        });
    }
    catch(err){
        return res.status(500).json({
            success : false,
            message : err.message
        });
    }
}
        

exports.getAllUserDetails = async (req,res)=>{
    try{
        //get id 
        const id = req.user.id;
        //get user details 
        const userDetails = await User.findById(id).populate("additionalDetails").exec()
        return res.status(200).json({
            success : true,
            message : "User details fetched successfully",
            // userDetails
    })


    }
    catch(err){
        return res.status(500).json({
            success : false,
            message : err.message
        })
    }
}
   
