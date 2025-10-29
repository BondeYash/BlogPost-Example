const express = require("express")
const userModel = require("./models/user.js")
const postModel = require("./models/post.js")
const cookieParser = require("cookie-parser")
const bcrypt = require("bcrypt")
const jwt =  require("jsonwebtoken")
const multerConfig  = require("./utils/multerConfig.js")

const app = express()
app.set("view engine" , "ejs")
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.get("/" , async (req , res) => {
    res.render("index")
})

app.get("/login" , async (req , res) => {
    res.render("login")
})


app.post("/register" , async (req , res) => {
    const { username , email , age , password} = req.body

    let user = await userModel.findOne({email})
    if(user) {
        return res.status(500).send("User already exists")
    }

    bcrypt.genSalt(10 , (err , salt) => {
        bcrypt.hash(password , salt , async (err , hash) => {
            if (err) throw err

            const newUser = await userModel.create({
                username,
                email,
                age,
                password : hash
            })
            const token = jwt.sign({ email : newUser.email , id : newUser._id} , "secret")
            res.cookie("token" , token , { httpOnly : true , maxAge : 24 * 60 * 60 * 1000  })
            res.status(201).redirect("/profile")
        })
    })


})


app.post("/login" ,  async (req , res) => {
    const { email , password} = req.body    
    const user = await userModel.findOne({ email : email})
    if(!user) {
        return res.status(400).send("Something went wrong")
    }

    const isMatch = await bcrypt.compare(password , user.password)
    if(!isMatch) {
        return res.status(400).send("Invalid credentials")
    }

    const token = jwt.sign({ email : user.email , id : user._id} , "secret")
    res.cookie("token" , token , { httpOnly : true , maxAge : 24 * 60 * 60 * 1000  })
    res.status(200).redirect("/profile")
})

app.get("/profile" , isLoggedIn , async (req , res) => {
    const user = await userModel.findOne({email : req.user.email}).populate("posts")
    res.render("profile" , { user })
})

app.get("/like/:id" , isLoggedIn , async (req , res) => {
   const post = await postModel.findOne({ _id : req.params.id}).populate("userId")

   if (post.likes.indexOf(req.user.id) !== -1) {
       post.likes.push(req.user.id)
   }else{
    post.likes.splice(post.likes.indexOf(req.user.id) , 1)
   }

   await post.save()
   res.redirect("/profile") 
   
})

app.get("/logout" , async(req,res) => {
    res.cookie("token" , "")
    res.redirect("/login")
})

app.post("/post" , isLoggedIn , async (req , res) => {
    const user = await userModel.findOne({ email : req.user.email})
    let { content } = req.body

    let post = await postModel.create({
        userId : user._id,
        content : content
    })

    user.posts.push(post._id)
    await user.save()
    res.redirect("/profile")

})

function isLoggedIn (req , res , next) {
    if (req.cookies.token === "") {
        return res.status(401).send("Unauthorized")
    }else {
        const data = jwt.verify(req.cookies.token , "secret")
        req.user = data
        next()
    }
}



app.listen(3000 , () => {
    console.log("Server is running on port http://127.0.0.1:3000")
})