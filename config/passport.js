//passport configuration needs a local strategy, this is how we set up a logged in session
const LocalStrategy = require("passport-local").Strategy;

//needs to access database to check password
const mongoose = require("mongoose");

//needs to compare hashed passwords using bcrypt
const bcrypt = require("bcryptjs");

//loads the user model we created
const User = require("../models/User");

//passport gets passed in from app.js file
module.exports = function(passport) {
  //creates a new local strategy using a given email, takes in
  passport.use(
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      //checks to see if an email in the database matches the login email
      User.findOne({ email: email })

        //if a user is returned, the result is stored in user
        .then(user => {
          //it either returns a user or null --> if no user returned, then return a null user (user does not exist)
          if (!user) {
            //return done, it is a callback
            return done(null, false, {
              message: "That email is not registered"
            });
          } else {

            //now we have to match the password with that email using bcrypt
            //user.password is a hashed password returned from the database, isMatch is boolean
            bcrypt.compare(password, user.password, (err, isMatch) => {
              if (err) throw err;
  
              //the user is passed
              //option if the user login password  matched the database password
              if (isMatch) {
                //return done function, pass null for error, return user for user (not false like seen above)
                return done(null, user);
              } else {
                //return done function, pass error message
                return done(null, false, { message: "Password incorrect" });
              }
            });

          }

        })
        .catch(err => console.log(err));
    })
  );

  //from passport documentation, we have to serialize and deserialize the users, stores authentication credentials in a user session
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
};
