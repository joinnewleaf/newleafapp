//we are going to use this route to update the user's goals, and retrieve user's goals

//requiring all modules
const express = require("express");

//to create an express router, need to create a router using Router function in express
const router = express.Router();

//create a user goals model, so we can call methods using mongoose
const UserGoals = require("../models/UserGoals");
//need to retrieve Days model
const Days = require("../models/Days"); //allows us to register users and post on their goals db

//must bring in our created passport authentication middleware to protect who can create goals
const { ensureAuthenticated } = require("../config/auth");

//self made functions found in controllers, likely want to replace with one big passkit library
// var passkit = require("../controllers/passkit"); //passkit function makes a request to passkit API

//this handles when users submit a registration form, makes a post request to /usergoals/update
router.post("/update", ensureAuthenticated, (req, res) => {
  //pulls goals from submitted form
  var {
    caloriesGoal: caloriesGoal,
    carbsGoal: carbsGoal,
    fatsGoal: fatsGoal,
    proteinsGoal: proteinsGoal,
    sodiumGoal: sodiumGoal,
    sugarsGoal: sugarsGoal
  } = req.body;

  //intialize an success message array
  let success_msgs = [];

  //we need to update the user goals if it already exists; we then need to temporarily store the original values, to check if they need changed
  UserGoals.findOne({
    $or: [
      { $and: [{ email: req.user.email }, { email: { $ne: "" } }] },
      { username: req.user.username },
    ],
  }) //should properly check if either username or email match

    //if this user exists, we update the goals; usergoals is the variable that mongodb function returns
    .then((usergoals) => {
      if (usergoals) {
        //if no info was submitted, set to the original goal, before updating
        if (caloriesGoal.length == 0) {
          caloriesGoal = usergoals.caloriesGoal;
        }
        if (carbsGoal.length == 0) {
          carbsGoal = usergoals.carbsGoal;
        }
        if (proteinsGoal.length == 0) {
          proteinsGoal = usergoals.proteinsGoal;
        }
        if (fatsGoal.length == 0) {
          fatsGoal = usergoals.fatsGoal;
        }
        if (sugarsGoal.length == 0) {
          sugarsGoal = usergoals.sugarsGoal;
        }
        if (sodiumGoal.length == 0) {
          sodiumGoal = usergoals.sodiumGoal;
        }

        // if user already exists, we update
        UserGoals.updateOne(
          {
            $or: [
              { $and: [{ email: req.user.email }, { email: { $ne: "" } }] },
              { username: req.user.username },
            ],
          },
          {
            caloriesGoal: caloriesGoal,
            carbsGoal: carbsGoal,
            fatsGoal: fatsGoal,
            proteinsGoal: proteinsGoal,
            sodiumGoal: sodiumGoal,
            sugarsGoal: sugarsGoal,
          }
        ).then(function () {
          //function runs asynchronously, so wait to render

          //to update pass, need to check if we are adding data for the current date
          let checkcurrentDate = new Date();
          let checkdateString = checkcurrentDate.toDateString();

          //query days
          Days.findOne({
            $or: [
              { $and: [{ email: req.user.email }, { email: { $ne: "" } }] },
              { username: req.user.username },
            ],
            dateString: checkdateString,
          })
            .then((days) => {
              //push flash message to screen to show it is updated, need to also pass in as we render
              success_msgs.push({ msg: "Goals updated" });

              //update pass using current days data
              // passkit.updatePass(req.user.email, days)

              //render the account page
              res.render("customize", {
                success_msgs,
                name: req.user.email,
                caloriesGoal: caloriesGoal,
                carbsGoal: carbsGoal,
                fatsGoal: fatsGoal,
                proteinsGoal: proteinsGoal,
                sodiumGoal: sodiumGoal,
                sugarsGoal: sugarsGoal,
              });
            })
            .catch((err) => console.log(err));
        });
      } else {
        //if new user AND no info was submitted, set goals to default FDA guidelines
        if (caloriesGoal.length == 0) {
          caloriesGoal = 2000;
        }
        if (carbsGoal.length == 0) {
          carbsGoal = 275;
        }
        if (proteinsGoal.length == 0) {
          proteinsGoal = 50;
        }
        if (fatsGoal.length == 0) {
          fatsGoal = 78;
        }
        if (sugarsGoal.length == 0) {
          sugarsGoal = 50;
        }
        if (sodiumGoal.length == 0) {
          sodiumGoal = 2300;
        }

        //if the user is new, we add new goals
        const newUserGoals = new UserGoals({
          email: req.user.email,
          username: req.user.username,
          caloriesGoal,
          carbsGoal,
          fatsGoal,
          proteinsGoal,
          sodiumGoal,
          sugarsGoal,
        });

        //save new goals in the db
        newUserGoals
          .save()

          //if user gets saved, render the page again, with updated information
          .then((user) => {
            //to update pass, need to check if we are adding data for the current date
            let checkcurrentDate = new Date();
            let checkdateString = checkcurrentDate.toDateString();

            //query days
            Days.findOne({
              $or: [
                { $and: [{ email: req.user.email }, { email: { $ne: "" } }] },
                { username: req.user.username },
              ],
              dateString: checkdateString,
            })
              .then((days) => {
                //update pass using current days data
                // passkit.updatePass(req.user.email, days)

                //render the account page
                res.render("customize", {
                  name: req.user.email,
                  caloriesGoal: caloriesGoal,
                  carbsGoal: carbsGoal,
                  fatsGoal: fatsGoal,
                  proteinsGoal: proteinsGoal,
                  sodiumGoal: sodiumGoal,
                  sugarsGoal: sugarsGoal,
                });
              })
              .catch((err) => console.log(err));
          })
          .catch((err) => console.log(err));
      }
    })
    .catch((err) => console.log(err));
});

//loads the page, and gets data from db every time page is rendered
router.get("/customize", ensureAuthenticated, (req, res) =>
  //we need to update the user goals if it already exists; we then need to temporarily store the original values, to check if they need changed
  UserGoals.findOne({
    $or: [
      { $and: [{ email: req.user.email }, { email: { $ne: "" } }] },
      { username: req.user.username },
    ],
  }) //should properly check if either username or email match

    //if this user exists, we render the page with the parameters already in the db
    .then((usergoals) => {
      //check if usersgoals exists in the database
      if (usergoals) {
        //sets goals data on the page to what's stored in the db
        let caloriesGoal = usergoals.caloriesGoal;
        let carbsGoal = usergoals.carbsGoal;
        let proteinsGoal = usergoals.proteinsGoal;
        let fatsGoal = usergoals.fatsGoal;
        let sugarsGoal = usergoals.sugarsGoal;
        let sodiumGoal = usergoals.sodiumGoal;

        //renders the customize page anytime this page gets called
        res.render("customize", {
          name: req.user.email,
          caloriesGoal: caloriesGoal,
          carbsGoal: carbsGoal,
          fatsGoal: fatsGoal,
          proteinsGoal: proteinsGoal,
          sodiumGoal: sodiumGoal,
          sugarsGoal: sugarsGoal,
        });
      } else {
        //if customize page get is requested, and there are no user goals to retrieve from, set to fda approved guidelines
        let caloriesGoal = 2000;
        let carbsGoal = 275;
        let proteinsGoal = 50;
        let fatsGoal = 78;
        let sugarsGoal = 50;
        let sodiumGoal = 2300;

        //if the user is new, we add new goals
        const newUserGoals = new UserGoals({
          email: req.user.email,
          username: req.user.username,
          caloriesGoal,
          carbsGoal,
          fatsGoal,
          proteinsGoal,
          sodiumGoal,
          sugarsGoal,
        });

        //save new goals in the db
        newUserGoals
          .save()

          //if user gets saved, render the page again, with updated information
          .then((user) => {
            //to update pass, need to check if we are adding data for the current date
            let checkcurrentDate = new Date();
            let checkdateString = checkcurrentDate.toDateString();

            //query days
            Days.findOne({
              $or: [
                { $and: [{ email: req.user.email }, { email: { $ne: "" } }] },
                { username: req.user.username },
              ],
              dateString: checkdateString,
            })
              .then((days) => {
                //update pass using current days data
                // passkit.updatePass(req.user.email, days)

                //render the account page
                res.render("customize", {
                  name: req.user.email,
                  caloriesGoal: caloriesGoal,
                  carbsGoal: carbsGoal,
                  fatsGoal: fatsGoal,
                  proteinsGoal: proteinsGoal,
                  sodiumGoal: sodiumGoal,
                  sugarsGoal: sugarsGoal,
                });
              })
              .catch((err) => console.log(err));
          })
          .catch((err) => console.log(err));
      }
    })
    .catch((err) => console.log(err))
);

//sets the default goals on first registration and on default button pressed
router.get("/default", ensureAuthenticated, (req, res) => {
  //intialize an success message array
  let success_msgs = [];

  //we need to update the user goals if it already exists; we then need to temporarily store the original values, to check if they need changed
  UserGoals.findOne({
    $or: [
      { $and: [{ email: req.user.email }, { email: { $ne: "" } }] },
      { username: req.user.username },
    ],
  }) //should properly check if either username or email match

    //if this user exists, we render the page with the parameters already in the db
    .then((usergoals) => {
      //check if usersgoals already exists in the database
      if (usergoals) {
        //sets goals data on the page to default values
        let caloriesGoal = 2000;
        let carbsGoal = 275;
        let proteinsGoal = 50;
        let fatsGoal = 78;
        let sugarsGoal = 50;
        let sodiumGoal = 2300;

        // if user already exists, we update
        UserGoals.updateOne(
          {
            $or: [
              { $and: [{ email: req.user.email }, { email: { $ne: "" } }] },
              { username: req.user.username },
            ],
          },
          {
            caloriesGoal: caloriesGoal,
            carbsGoal: carbsGoal,
            fatsGoal: fatsGoal,
            proteinsGoal: proteinsGoal,
            sodiumGoal: sodiumGoal,
            sugarsGoal: sugarsGoal,
          }
        )
          .then(function () {
            //function runs asynchronously, so wait to render
            //to update pass, need to check if we are adding data for the current date
            let checkcurrentDate = new Date();
            let checkdateString = checkcurrentDate.toDateString();

            //query days
            Days.findOne({
              $or: [
                { $and: [{ email: req.user.email }, { email: { $ne: "" } }] },
                { username: req.user.username },
              ],
              dateString: checkdateString,
            })
              .then((days) => {
                //update pass using current days data
                // passkit.updatePass(req.user.email, days)

                //push flash message to screen to show it is updated, need to also pass in as we render
                success_msgs.push({ msg: "Goals set to default" });

                //render the account page
                res.render("customize", {
                  success_msgs,
                  name: req.user.email,
                  caloriesGoal: caloriesGoal,
                  carbsGoal: carbsGoal,
                  fatsGoal: fatsGoal,
                  proteinsGoal: proteinsGoal,
                  sodiumGoal: sodiumGoal,
                  sugarsGoal: sugarsGoal,
                });
              })
              .catch((err) => console.log(err));
          })
          .catch((err) => console.log(err));
      } else {
        //if user is new, we create a new user and set these goals, THIS SHOULD ONLY HAPPEN ONCE FOR EACH USER REGISTRATION
        let caloriesGoal = 2000;
        let carbsGoal = 275;
        let proteinsGoal = 50;
        let fatsGoal = 78;
        let sugarsGoal = 50;
        let sodiumGoal = 2300;

        //if the user is new, we add new goals
        const newUserGoals = new UserGoals({
          email: req.user.email,
          username: req.user.username,
          caloriesGoal,
          carbsGoal,
          fatsGoal,
          proteinsGoal,
          sodiumGoal,
          sugarsGoal,
        });

        //save new goals in the db
        newUserGoals
          .save()

          //if user gets saved, render the page again, with updated information
          .then((user) => {
            //update pass after new goals are saved
            // passkit.updatePass(req.user.email);
          })
          .catch((err) => console.log(err));
      }
    })
    .catch((err) => console.log(err));
});

//exports the router function to be used in app
module.exports = router;
