const mongoose = require('mongoose');


const Subsection = new mongoose.Schema({
    title  :{
        type : String,

    },
    timeDuration:{
        type : String,
    },
    description:{
        type : String,
    },
    videoUrL :{
        type : String,
    }

  

})

module.exports = mongoose.model('Subsection',Subsection)