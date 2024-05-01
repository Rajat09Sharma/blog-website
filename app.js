require('dotenv').config(); 
const express=require("express");
const bodyParser=require("body-parser");
var _=require("lodash");
const mongoose=require("mongoose");
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
const  findOrCreate = require('mongoose-findorcreate');


const app=express();
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));



app.use(session({
    secret:process.env.SECRET,
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect(process.env.MONGODB_URL);
const blogSchema= new mongoose.Schema({
    post:{
        title:String,                    
        content:String  
    }  
});

const Post=mongoose.model("post",blogSchema);

const userSchema=new mongoose.Schema({
    email:String,
    password:String
        
});
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const Users= mongoose.model("user",userSchema);

passport.use(Users.createStrategy());

passport.serializeUser(Users.serializeUser());
passport.deserializeUser(Users.deserializeUser());

app.get("/",function(req,res){
    res.render("home");
});

app.get("/postHome",function(req,res){
    Post.find({},function(err,foundData){
        if(!err){
           res.render("postHome",{blogPost:foundData }); 
        }
    });
    
});

app.get("/posts/:postid",function(req,res){
    const postId=req.params.postid;

    Post.findOne({_id:postId},function(err,foundData){
        if(!err){
            res.render("post",{title:foundData.post.title,content:foundData.post.content});
        }
        
    });
});


app.get("/about",function(req,res){
    res.render("about");
});

app.get("/contact",function(req,res){
    res.render("contact");
});

app.get("/login",function(req,res){
    res.render("login");
});

app.get("/register",function(req,res){
    res.render("register");
});

app.get("/create",function(req,res){
    if (req.isAuthenticated()){
        res.render("create");
      } else {
        res.redirect("/login");
      }
});

app.post("/register",function(req,res){
   Users.register({username:req.body.username},req.body.password,function(err,user){
    if(err){
        console.log(err);
        res.redirect("/register");
    }else{
        passport.authenticate("local")(req,res,function(){
            res.redirect("/create");
        });
    }}); 
});

app.post("/create",function(req,res){
    const userTitle =req.body.title;
    const userContent=req.body.content;

    const blog= new Post({
        post:{
            title:userTitle,
            content:userContent
        }
 
    });

    blog.save(function(err){
        console.log(err);
        if(!err){
            res.redirect("/postHome");
        }
    });
});

app.post("/login", function(req, res){

    const user = new Users({
      username: req.body.username,
      password: req.body.password
    });
  
    req.login(user, function(err){
      if (err) {
        console.log(err);
      } else {
        passport.authenticate("local")(req, res, function(){
          res.redirect("/create");
        });
      }
    });
});
  
app.get("/logout",function(req,res){
    req.logOut(function(err){
        if(err){
            console.log(err);
        }else{
            res.redirect("/");
        }
    });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port,function(req,res){
    console.log("server has startes successfully.");
});