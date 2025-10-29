const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/post', { useNewUrlParser: true, useUnifiedTopology: true })   

const userSchema = new mongoose.Schema ({
    username : {
        type : String
    },
    email : {
        type : String
    },
    age : {
        type : Number
    },
    password : {
        type : String
    },
    posts : [
        {
            type : mongoose.Schema.Types.ObjectId,
            ref : 'Post'
        }
    ],
    profilePic : {
        type : String,
        default : ""
    }
})

const userModel = mongoose.model('User', userSchema)

module.exports = userModel  