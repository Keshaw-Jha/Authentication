//REQUIRES
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

// console.log(process.env.PASS);

//APP
const app = express();



//DATABASE CONNECTION
mongoose.connect('mongodb://127.0.0.1:27017/userDB');

//SET
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

///DATABASE 
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

//ADDING SECRET TO SCHEMA

userSchema.plugin(encrypt, { 
        secret: process.env.SECRET , 
        encryptedFields: ['password'] 
    });

///MODEL using SCHEMA
const User = new mongoose.model("User",userSchema);


///WORKING

//HOME ROUTE
app.route("/")
    .get((req,res)=>{
        res.render("home");
    })

//REGISTER ROUTE
app.route('/register')
    .get((req,res)=>{
        res.render("register");
    })

    .post((req,res)=>{
        const newUser = new User({
            email: req.body.username,
            password: req.body.password
        });

        newUser.save()
        .then(doc=>{
            // we are rendering the secrets page from inside the register bcoz we want to render it only when some one is registered or logged in.
            res.render("secrets");
        })
        .catch(error => {
            res.render(error);
        });

    })


//LOGIN ROUTE
app.route("/login")

    .get((req,res)=>{
        res.render("login");
    })

    .post(async(req,res)=>{
        const username = req.body.username;
        const password = req.body.password;

        User.findOne({email: username})
        .then(doc =>{
            if(doc){
                if(doc.password === password){
                    res.render("secrets");
                }
                else{
                    res.send("password is wrong");
                }
            }
            else {
                res.send("no user account found with this name");
            }
        });
    })





//APP LISTEN

app.listen(3000,(req,res)=>{
    console.log("server started at port 3000");
});