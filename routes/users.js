//typically for routing users/login or users/registration

//we use express router to make this easy
const express = require("express");

//to create an express router, need to create a router using Router function in express
//this can now be used to listen to requests on the specified port
const router = express.Router();

//create a user model, so we can call methods using mongoose
//this is getting required from the models folder
const User = require("../models/User");
const UserGoals = require("../models/UserGoals"); //allows us to register users and post on their goals db


//this package is used for encrypting passwords so you can store hashed passwords in your database
const bcrypt = require("bcryptjs");

//need to require this for login route
const passport = require("passport");

//self made functions found in controllers, likely want to replace with one big passkit library
var passkit = require("../controllers/passkit"); //passkit function makes a request to passkit API
//this jwt is specifically used to authenticate requests to Passkit API

//check index.js file in routes folder for these notes, now we are taking a user login request
//gets commented out and replaced with render functions
//router.get('/login', (req,res) => res.send('Login'));

//similar to the login request, for registration
//router.get('/register', (req,res) => res.send('Register'));

//when button is clicked in the welcome page, (request gets made) then we render the login and registration views found in the views folder
router.get("/login", (req, res) => res.render("login"));
router.get("/register", (req, res) => res.render("register"));

//this handles when users submit a registration form, makes a post request to /users/register
router.post("/register", (req, res) => {
  //this will pull parameters out of the request.body
  //remember we can only do this because we used the body parser
  //this is just a simpler way to pull these out
  //we also want to call our validation as the user submits these, ie password length, password mismatch
  //can also use a third party package to do the validation
  const { name, email, password, password2 } = req.body;

  //do this before we submit to the database
  let errors = [];

  //checks if all the required fields are filled in
  if (!name || !email || !password || !password2) {
    //if any of these are not filled in, we push an error message (appends the message to empty errors array)
    errors.push({ msg: "Please fill in all fields" });
  }

  //checks that the password is the right length
  if (password.length < 6) {
    errors.push({ msg: "Password should be at least 6 characters" });
  }

  //checks that the passwords match
  if (password !== password2) {
    errors.push({ msg: "Passwords do not match" });
    console.log('inhere');
  }

  //if we have an issue with validation, we want to rerender the registration form
  if (errors.length > 0) {
    //when we render, we need to pass things to the view
    //in the partials messages ejs file, it checks for an error that gets passed
    res.render("register", {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    //if validated, now we want to store the new user to the database

    //first we check if the user is actually new, findOne is a mongoose method to search for matching terms
    //we pass it our query (checks if the email equals an already used email), this returns a promise
    User.findOne({ email: email })

      //if this user exists, rerender the register form and say user already exists
      .then(user => {
        if (user) {
          errors.push({ msg: "Email is already registered" });
          res.render("register", {
            errors,
            name,
            email,
            password,
            password2
          });
        } else {

          //if this is a new user, we create a pass for them
          let passID = passkit.createPass(email);

          //we will create a new user using a new instance of User model, does not save
          const newUser = new User({
            name,
            email,
            password,
          });

          //this is where we hash the password (after creating an instance of User seen above)
          //bcrypt hash takes a plain text password and a salt, and gives a hash back
          bcrypt.genSalt(10, (error, salt) =>
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;

              console.log(passID);

              //sets password to hashed password
              newUser.password = hash;

              //save the user in the DB
              newUser
                .save()

                //if user gets saved, redirect to the login page
                .then(user => {

                  //if user is new, we create a new user and set these goals, THIS SHOULD ONLY HAPPEN ONCE FOR EACH USER REGISTRATION
                  let caloriesGoal = 2000;
                  let carbsGoal = 275;
                  let proteinsGoal = 50;
                  let fatsGoal = 78;
                  let sugarsGoal = 37.5;
                  let sodiumGoal = 2300;

                  //if the user is new, we add new goals
                  const newUserGoals = new UserGoals({
                    email: email,
                    caloriesGoal,
                    carbsGoal,
                    fatsGoal,
                    proteinsGoal,
                    sodiumGoal,
                    sugarsGoal
                  });

                  //save new goals in the db
                  newUserGoals
                    .save()

                    //if user gets saved, render the page again, with updated information
                    .then(user => {

                      //intialize an success message array
                      let success_msgs = [];

                      //push flash message to screen to show it is updated, need to also pass in as we render
                      success_msgs.push({ msg: "You are now registered and can log in." })
                      //multiple flash messages
                      success_msgs.push({ msg: "Check your email for your digital card." })

                      //render the login page, should probably change to redirect but was having trouble with async flash messages
                      res.render("login", {
                        success_msgs,
                      });
                    })


                    .catch(err => console.log(err));

                })
                .catch(err => console.log(err));
            })
          );
        }
      });
  }
});

//when logging in need to create a login route
router.post("/login", (req, res, next) => {

  //using the local strategy (passing in local)
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/users/login",
    failureFlash: true
  })(req, res, next);
});

//handles user logouts using passport middleware
router.get("/logout", (req, res) => {

  //intialize an success message array
  let success_msgs = [];
  req.logout();

  //push flash message to screen to show it is updated, need to also pass in as we render
  success_msgs.push({ msg: "You are logged out" })

  //render the login page, should probably change to redirect but was having trouble with async flash messages
  res.render("login", {
    success_msgs,
  });

});

//exports the router function to be used in app
module.exports = router;
