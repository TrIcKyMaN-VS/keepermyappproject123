const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");
const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const path = require('path')
var app = express();
// const summa = require('./routes/summa')

var app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname , 'build')))

app.use(
  session({
    secret: "our secret key",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://vasanth:vasanth12@cluster0.dnppu.mongodb.net/TodoDB?retryWrites=true");
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
});

const itemSchema = {
  userId: String,
  tittle: String,
  desc: String,
};

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

const Item = mongoose.model("Item", itemSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Routers GET
// router.get("/",(req,res)=>{
//   Create.find({},(err,val)=>{
//       const values = val
//       res.render("home",{list:val})
//   })

// });

app.get("/register", (req, res) => {
  res.json("register");
});
app.get("/login", (req, res) => {
  res.json("login");
});

app.get("/*", (req,res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'))
})

//Register

app.post("/api/register", (req, res) => {
  console.log(req.body);

  let nme = req.body.username;
  let pswd = req.body.password;

  User.register({ username: nme }, pswd, (err, user) => {
    console.log("ifbeore");
    if (err) {
      console.log(err);
      res.json(err);
    } else {
      passport.authenticate("local")(req, res, function () {
        // console.log(user._id)
        console.log("success");
        // res.json("success");
        res.json(user);
      });
    }
  });
});

//Login

app.post("/api/login", (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  req.logIn(user, (err) => {
    if (err) {
      console.log(err);
      res.send(err);
    } else {
      passport.authenticate("local")(req, res, () => {
        const name = req.body.username;
        User.findOne({ username: name }, (err, val) => {
          if (!err) {
            console.log(val);
            // res.redirect(`/userpage/${val._id}`)
            res.send(val);
          }
        });
      });
    }
  });
});

//addnote get

app.get("/api/addnote/:userId", (req, res) => {
  let userId = req.params.userId;

  Item.find({ userId: userId }, (err, doc) => {
    if (err) console.log(err);
    console.log(doc);
    res.json(doc);
  });
});

//add notes post

app.post("/api/addnote", (req, res) => {
  // console.log(req.body);
  const { userId, tittle, desc } = req.body;
  // let _id = req.body._id
  // let tittle = req.body.tittle
  // let desc = req.body.desc

  const newItem = new Item({
    userId,
    tittle,
    desc,
  });
  newItem.save((err, doc) => {
    if (!err) {
      res.json(doc);
      console.log("successfully inserted");
    } else {
      res.json(err);
      console.log(err);
    }
  });
  // console.log(newItem);
});

//DeleteNote

app.delete("/api/addnote/:id", (req, res) => {
  Item.findByIdAndDelete(req.params.id, (err, doc) => {
    if (err) {
      console.log(err);
    } else {
      res.json(doc);
      console.log("successfully Deleted");
    }
  });
});

//edit note get method
app.get("/api/editnote/:userId", (req, res) => {
  let userId = req.params.userId;
  
  Item.findById(userId, (err, doc) => {
    if (err) console.log(err);
    console.log(doc);
    res.json(doc);
  });
});

//editnote put method

app.put("/api/editnote/:id", (req,res) => {
  let id = req.params.id
  const {tittle, desc} = req.body
  // console.log("rec");
  Item.findByIdAndUpdate(id, {tittle, desc},(err,doc) => {
    if(!err){
      console.log("updated succesfully");
      res.json(doc)
    }else console.log(err);
  })
})

app.get("/", (req,res) =>{
  res.json("rgbkdfbdfkdfkhb")
})


let port = process.env.PORT || 4444;
// if(port ==null || port == ""){
//     port = 3000;
// }
app.listen(port, () => {
  console.log("server started");
});
