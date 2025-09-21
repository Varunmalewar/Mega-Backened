const Section = require('../models/Section');
const Course = require('../models/Course');
const Subsection = require('../models/Subsection');


exports.createSection = async (req,res)=>{
    try{
        //fetch data 
        const {sectionName,courseId} = req.body;


        //validation data 
        if(!sectionName || !courseId){
            return res.status(500).json({
                success : false,
                message : "All fields are required"

            });
        }

        //create section
        const newSection = await Section.create({
            sectionName
        })
        //update course and populate sectiion and subsection 
        const updatedCourseDetails = await Course.findByIdAndUpdate(courseId,{
            $push : {courseContent : newSection._id}
        },{
            new : true
        }).populate("courseContent.subSection");
        console.log(updatedCourseDetails)
        
        //return response 
        return res.status(201).json({
            success : true,
            message : "Section created successfully",
            data : updatedCourseDetails
        })


    }
    catch(err){
        return res.status(500).json({
            success : false,
            message : "Unable to create section please try again",
            error : err.message

        })
    

    }
}

exports.updateSection = async(req,res)=>{
    try{
        // data input 
        const {sectionName,sectionId} = req.body
        // data validation 
        if(!sectionName || !sectionId){
            return res.status(400).json({
                success : false,
                message : "All fields are required"
            })
        
        }
        //update∈data
        const section = await Section.findByIdAndUpdate(sectionId ,{
            sectionName
        },{
            new:true
        })

        //return response  
        return res.status(200).json({
            success : true,
            message : "Section updated successfully",
            data : section
        })


    }
    catch(err){
        return res.status(500).json({
            success : false,
            message : "Unable to update section please try again",
            error : err.message

        })
    }

}


exports.deleteSection = async (req,res)=>{
    try{
        // get id - assuming that we are sending id in params

        const {sectionId} = req.params;

        //use findbyidanddelete 
        const deletedSection = await Section.findByIdAndDelete(sectionId);
       
         //need to delete the entry from the course schema 
           await Course.findOneAndUpdate(
                     { courseContent: sectionId },
                     {
                         $pull: {
                             courseContent: sectionId
                         }
                     }
                 );
                 // Also delete associated subsections
                 await Subsection.deleteMany({ _id: { $in: deletedSection.subSection } });



        
        
        


        // return response 
        return res.status(200).json({
            success : true,
            message : "Section deleted successfully"
    })



    }
    catch(err){
        return res.status(400).json({
            success : false,
            message : "Unable to delete section please try again",
            error : err.message

        })

    }
}