const mongoose = require('mongoose')

   

const postSchema = new mongoose.Schema ({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    date : {
        type : Date,
        default : Date.now
    },
    content : {
        type : String
    },
    likes : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'User'
        }
    ]

})

const postModel = mongoose.model('Post', postSchema)

module.exports = postModel