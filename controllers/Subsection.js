const SubSection = require("../models/Subsection");
const Section = require("../models/Section");
const uploadImageToCloudinary = require("../utils/imageUploader");
require('dotenv').config();

//create subsection
exports.createSubsection = async (req,res)=>{
    try{
        //fetch data 
        const {title,description,timeDuration,sectionId} = req.body;
        //extract file/video
        const videoFile = req.files.videoFile;
        //validation data 
        if(!title || !description || !timeDuration || !sectionId || !videoFile){
            return res.status(500).json({
                success : false,
                message : "All fields are required"

            });
        }
        //upload video to cloudinary
        const uploaddetails = await uploadImageToCloudinary(videoFile,process.env.FOLDER_NAME);

        //create sub-section
        const SubsectionDetails = await SubSection.create({
            title : title,
            timeDuration : timeDuration,
            description : description,
            videoUrL : uploaddetails.secure_url
        })
        //update section with new subsection log updated section after adding populate query
        const updatedSection = await Section.findByIdAndUpdate( {_id:sectionId},
            {
                $push : {subSection : SubsectionDetails._id}
            },
            {
                new : true
            }
             
        ).populate("subSection");
        console.log(updatedSection);

        //return response
        return res.status(200).json({
            success : true,
            message : "Subsection created successfully",
            data : updatedSection
        })

    }
    catch(err){
        return res.status(500).json({
            success : false,
            message : "Unable to create subsection please try again",
            error : err.message

        })
    

    }
}

//update subsection
exports.updateSubsection = async (req, res) => {
    try {
        const { title, description, timeDuration, subsectionId, sectionId } = req.body;
        const videoFile = req.files?.videoFile;

        // Validation
        if (!title || !description || !timeDuration || !subsectionId || !sectionId) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const subsection = await SubSection.findById(subsectionId);

        if (!subsection) {
            return res.status(404).json({
                success: false,
                message: "Subsection not found"
            });
        }

        subsection.title = title;
        subsection.description = description;
        subsection.timeDuration = timeDuration;

        if (videoFile) {
            const uploadDetails = await uploadImageToCloudinary(videoFile, process.env.FOLDER_NAME);
            subsection.videoUrL = uploadDetails.secure_url;
        }

        await subsection.save();

        const updatedSection = await Section.findById(sectionId).populate("subSection");

        return res.status(200).json({
            success: true,
            message: "Subsection updated successfully",
            data: updatedSection
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Unable to update subsection, please try again",
            error: err.message
        });
    }
}


// delete subsection
exports.deleteSubsection = async (req, res) => {
    try {
        const { subsectionId, sectionId } = req.body;

        // Validate input
        if (!subsectionId || !sectionId) {
            return res.status(400).json({
                success: false,
                message: "Subsection ID and Section ID are required"
            });
        }

        // Delete the subsection from the Subsection model
        await SubSection.findByIdAndDelete(subsectionId);

        // Remove the subsection reference from the Section model
        const updatedSection = await Section.findByIdAndUpdate(
            sectionId,
            { $pull: { subSection: subsectionId } },
            { new: true }
        ).populate("subSection");

        return res.status(200).json({
            success: true,
            message: "Subsection deleted successfully",
            data: updatedSection
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Unable to delete subsection, please try again",
            error: err.message
        });
    }
}