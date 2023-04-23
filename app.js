//REQUIRES
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require ('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();

// PREVIOUS SECURITIES
// const encrypt = require('mongoose-encryption');
//MD5
//const md5 = require('md5');
// const bcrypt = require('bcrypt');
// const saltRounds = 10;

// console.log(process.env.PASS);

//APP



//DATABASE CONNECTION
mongoose.connect('mongodb://127.0.0.1:27017/userDB');


//SET
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));
//SESSION integrated
app.use(session({
    secret: "tera beti ka saccha ashiq.",
    resave: false,
    saveUninitialized: false
}));
///PASSPORT
app.use(passport.initialize());
app.use(passport.session());




///DATABASE 
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

//adding passport local plugin
userSchema.plugin(passportLocalMongoose);

//ADDING SECRET TO SCHEMA

// userSchema.plugin(encrypt, { 
//         secret: process.env.SECRET , 
//         encryptedFields: ['password'] 
//     });

///MODEL using SCHEMA
const User = new mongoose.model("User",userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

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
        User.register({username: req.body.username}, req.body.password)
        .catch(err => {
            res.send(err);
        })
        .then(() => {           
            passport.authenticate("local")(req,res,function () {
                res.redirect("/secrets");
            })
        })
    })


//LOGIN ROUTE
app.route("/login")

    .get((req,res)=>{
        res.render("login");
    })

    .post((req,res)=>{
        const user = new User ({
            username : req.body.username,
            password : req.body.password
        });

        req.login(user,function(err){
            if(err) {
                console.log(err);
            } else {               
                passport.authenticate("local")(req,res,function () {
                    res.redirect("/secrets");
                })
            }
        })
    });

//SECRETS ROUTE

app.route("/secrets")   
    
    .get((req,res)=>{
        if(req.isAuthenticated()){
            res.render("secrets");
        } else {
            res.redirect("/login");
        }
    })

//LOGOUT

app.route("/logout")
    .get((req,res)=>{
        req.logout((err)=>{
            if(err){
                res.send(err);
            }
            res.redirect("/");
        });
    })


//APP LISTEN

app.listen(3000,(req,res)=>{
    console.log("server started at port 3000");
});