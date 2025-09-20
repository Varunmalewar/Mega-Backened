const Course = require('../models/Course');
const User = require('../models/User');
const uploadImageToCloudinary = require('../utils/imageUploader');
const Tag = require('../models/Tags');
const { error } = require('console');



//Creat∈course 
exports.createCourse = async (req, res)=>{
    try{
        // fetch data
        const {courseName, courseDescription , whatYouWillLearn , price , tag } = req.body;

        //get thumbnail
        const thumbnail = req.files.thumbnailImage

        //validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnail){
            return res.status(400).json({
                success:false,
                message:"All fields are required"

            })
        }

        //check for  instructor
        const userId = req.user.id;

        const instructorDetails = await User.findById(userId); 
        console.log("Instructor Details", instructorDetails);
        //TODO : Verify that userID and instructorDetails._id


        if(!instructorDetails){
            return res.status(404).json({
                success : false,
                message : "Instructor not found"
            })
        }

        //check given tag is valid or not 
        const tagDetails = await Tag.findById(tag);
        if(!tagDetails){
            return res.status(404).json({
                success : false,
                message : "Tag  Details not found"
            })

        }
        //upload image to cloudinary 
        const thumbnailImage  = await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME);

        //create an entry fro new course 
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor : instructorDetails._id,
            whatyouwilllearn : whatYouWillLearn,
            price,
            tag : tagDetails._id,
            thumbnail : thumbnailImage.secure_url


          

            })
              //add the new course to the user schema of Instructor
            await User.findByIdAndUpdate(
                {_id : instructorDetails._id},
                {
                    $push : {courses : newCourse._id}
                },

            
        
            
            );

            //update tag schema
            await Tag.findByIdAndUpdate(
                {_id : tagDetails._id},
                {
                    $push : {course : newCourse._id}
                },
                {
                    new : true
                }
            )

            return res.status(201).json({
                success : true,
                message : "Course created successfully",
                data :newCourse
            })





            
            
        }

    catch(err){
        console.log(err);

        return res.status(500).json({
            success : false,
            message : "Failed to create course",
            err : err.message
              })

    }
}


//get all courses

exports.getAllCourses = async (req,res)=>{
    try{
        //TODO change 
        const allCourses = await Course.find({},{courseName:true,
            price :true,
            thumbnail:true,
            instructor:true,
            ratingAndReviews:true,
            studentsEnrolled:true
        }).populate("instructor").exec();

        return res.status(200).json({
            success : true,
            message : "All courses fetched successfully",
            data :allCourses
        })


    }
    catch(err){
        return res.status(400).json({
            success : false,
            message : err.message
        })
    
    }
}
