const  Tag = require('../models/Tags');
const Course = require('../models/Course');


//create Tag ka handler function 
exports.createTag = async (req,res)=>{
    try{
        //fetch data 
        const {name,description} = req.body;
        //validation
        if(!name || !description){
            return res.status(400).json({
                success : false,
                message : "All fields are required"
            })
        }
        //create entry in db 
        const tagDetails = await Tag.create({
            name,
            description
        
        })
        console.log(tagDetails)

        // return response 
        return res.status(201).json({
            success : true,
            message : "Tag created successfully",
            tagDetails
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



//getalltags handler function

exports.showAlltags = async (req,res)=>{
    try{
        const allTags = await Tag.find({},{name:true,description:true});
        return res.status(200).json({
            success : true,
            message : "All tags fetched successfully",
            allTags

            });


    }
    catch(err){
        console.log(err);  
        return res.status(401).json({
            success : false,
            message : err.message

        }) 
    }
}