//homepage routes and anything with / goes in index.js
//routing refers to how an application responds to client requests (PHP), no longer client sides
//takes input from user, maybe a post request or a get request, and makes action on server side

//we use express router to make this easy
const express = require("express");

//to create an express router, need to create a router using Router function in express
//this can now be used to listen to requests on the specified port
const router = express.Router();

//need to retrieve UserGoals model
const UserGoals = require("../models/UserGoals"); //allows us to register users and post on their goals db

//need to retrieve Days model
const Days = require("../models/Days"); //allows us to register users and post on their goals db

//must bring in our created passport authentication middleware to protect dashboard route
const { ensureAuthenticated } = require("../config/auth");

//self made functions found in controllers, likely want to replace with one big passkit library
var passkit = require("../controllers/passkit"); //passkit function makes a request to passkit API

//whenever we want to create a route we use get or post, pass it what the user requested (router. creates a method for routing)
//for instance '/' for the homepage
//when working with express, we get access to a request and a response object
//when the application receives an HTTP request, req shows what user sent, and res can send info back to user
//res.send() is a way to send send the response back to the user
//to finally get this next function to work, we have to include these functions in our app.js
//router.get('/', (req,res) => res.send('Welcome'));//=> is called a fat arrow function, replaces having to write function, curly brackets, and return keywords, arrow then calls the function after the response

//we end up using res.render to actually render the ejs view when we get a request to the homepage
//this renders whatever is in the welcome view file, and uses the layout file to format it correctly
//ends up having all the bootswatch templating, fontawesome, and layouts correctly laid out

//welcome page
router.get("/", (req, res) => res.render("welcome"));

//dashboard page, we pass in ensure athenticated as a second parameter middleware
//when we render the dashboard we pass in an object to let it know the user
router.get("/dashboard", ensureAuthenticated, (req, res) => {

  //we need to update the user goals if it already exists; we then need to temporarily store the original values, to check if they need changed
  UserGoals.findOne({ email: req.user.email })

    //if this user exists, we render the page with the parameters already in the db
    .then(usergoals => {

      //check if usersgoals exists in the database; if the user exists, we check if a Day exists for the current date
      if (usergoals) {

        //sets goals data on the page to what's stored in the db
        let caloriesGoal = usergoals.caloriesGoal;
        let carbsGoal = usergoals.carbsGoal;
        let proteinsGoal = usergoals.proteinsGoal;
        let fatsGoal = usergoals.fatsGoal;
        let sugarsGoal = usergoals.sugarsGoal;
        let sodiumGoal = usergoals.sodiumGoal;

        //current datetime
        let currentDate = new Date()

        //we need to pull data from the requested date (or create a new Days instance), matches to both date AND email
        Days.findOne({ email: req.user.email, dateString: currentDate.toDateString() })

          //if this user exists, and a Day exists for this date rerender the page with goals data and pass it in the Transactions for that date
          .then(days => {

            //if this user exists with this date, render the page with both the goals AND the transactions for that date
            if (days) {

              //render the dashboard page and pass in the Day, which should include the IDs for transactions for that date
              //also pass in the goals we set earlier
              res.render("dashboard", {
                name: req.user.name,
                caloriesGoal: caloriesGoal,
                carbsGoal: carbsGoal,
                fatsGoal: fatsGoal,
                proteinsGoal: proteinsGoal,
                sodiumGoal: sodiumGoal,
                sugarsGoal: sugarsGoal,
                days: days
              });

              //if this Day does not exist for that user, create new one
            } else {

              //we will create a new Day using a new instance of Day model, does not save
              const newDays = new Days({
                email: req.user.email,
                date: currentDate,
                dateString: currentDate.toDateString()
              });
              //save the Day in the DB
              newDays
                .save()

                //if days gets saved, render the dashboard page
                .then(days => {
                  console.log(days);

                  //renders the dashboard page anytime this page gets called
                  res.render("dashboard", {
                    name: req.user.name,
                    caloriesGoal: caloriesGoal,
                    carbsGoal: carbsGoal,
                    fatsGoal: fatsGoal,
                    proteinsGoal: proteinsGoal,
                    sodiumGoal: sodiumGoal,
                    sugarsGoal: sugarsGoal,
                    days: days

                  });
                })

                .catch(err => console.log(err));
            }
          })

          .catch(err => console.log(err));

      } else {

        //if dashboard page get is requested, and there are no user goals to retrieve from, set to fda approved guidelines
        //also need if/else statements in here for Day transactions
        let caloriesGoal = 2000;
        let carbsGoal = 275;
        let proteinsGoal = 50;
        let fatsGoal = 78;
        let sugarsGoal = 37.5;
        let sodiumGoal = 2300;

        //we need to pull data from the requested date (or create a new Days instance), matches to both date AND email
        Days.findOne({ email: req.user.email, dateString: currentDate.toDateString() })

          //if this user exists, and a Day exists for this date rerender the page with goals data and pass it in the Transactions for that date
          .then(days => {

            //if this user exists with this date, render the page with both the goals AND the transactions for that date
            if (days) {

              //render the dashboard page and pass in the Day, which should include the IDs for transactions for that date
              //also pass in the goals we set earlier
              res.render("dashboard", {
                name: req.user.name,
                caloriesGoal: caloriesGoal,
                carbsGoal: carbsGoal,
                fatsGoal: fatsGoal,
                proteinsGoal: proteinsGoal,
                sodiumGoal: sodiumGoal,
                sugarsGoal: sugarsGoal,
                days: days
              });

              //if this Day does not exist for that user, create new one
            } else {

              //we will create a new Day using a new instance of Day model, does not save
              const newDays = new Days({
                email: req.user.email,
                date: currentDate,
                dateString: currentDate.toDateString()
              });
              //save the Day in the DB
              newDays
                .save()

                //if days gets saved, render the dashboard page
                .then(days => {

                  //renders the dashboard page anytime this page gets called
                  res.render("dashboard", {
                    name: req.user.name,
                    caloriesGoal: caloriesGoal,
                    carbsGoal: carbsGoal,
                    fatsGoal: fatsGoal,
                    proteinsGoal: proteinsGoal,
                    sodiumGoal: sodiumGoal,
                    sugarsGoal: sugarsGoal,
                    days: days
                  });
                })
                .catch(err => console.log(err));
            }
          })
          .catch(err => console.log(err));
      }
    })

    .catch(err => console.log(err));
});

//post request on the dashboard pulls in data from the database for a certain date
router.post("/dashboard", ensureAuthenticated, (req, res) => {

  //pull date from submitted request, turns into readable format using JS Date methods
  let parsedDate = Date.parse(req.body.date);
  let dateRequest = new Date(parsedDate);

  //we need to update the user goals if it already exists; we then need to temporarily store the original values, to check if they need changed
  UserGoals.findOne({ email: req.user.email })

    //if this user exists, we render the page with the parameters already in the db
    .then(usergoals => {

      //check if usersgoals exists in the database; if the user exists, we check if a Day exists for the current date
      if (usergoals) {

        //sets goals data on the page to what's stored in the db
        let caloriesGoal = usergoals.caloriesGoal;
        let carbsGoal = usergoals.carbsGoal;
        let proteinsGoal = usergoals.proteinsGoal;
        let fatsGoal = usergoals.fatsGoal;
        let sugarsGoal = usergoals.sugarsGoal;
        let sodiumGoal = usergoals.sodiumGoal;

        //we need to pull data from the requested date (or create a new Days instance), matches to both date AND email
        Days.findOne({ email: req.user.email, dateString: dateRequest.toDateString() })

          //if this user exists, and a Day exists for this date rerender the page with goals data and pass it in the Transactions for that date
          .then(days => {

            //if this user exists with this date, render the page with both the goals AND the transactions for that date
            if (days) {

              //render the dashboard page and pass in the Day, which should include the IDs for transactions for that date
              res.render("dashboard", {
                name: req.user.name,
                caloriesGoal: caloriesGoal,
                carbsGoal: carbsGoal,
                fatsGoal: fatsGoal,
                proteinsGoal: proteinsGoal,
                sodiumGoal: sodiumGoal,
                sugarsGoal: sugarsGoal,
                days: days
              });

              //if this Day does not exist for that user, create new one
            } else {

              //we will create a new Day using a new instance of Day model, does not save
              const newDays = new Days({
                email: req.user.email,
                date: dateRequest,
                dateString: dateRequest.toDateString()
              });
              //save the Day in the DB
              newDays
                .save()

                //if days gets saved, render the dashboard page
                .then(days => {

                  console.log(days);

                  //renders the dashboard page anytime this page gets called
                  res.render("dashboard", {
                    name: req.user.name,
                    caloriesGoal: caloriesGoal,
                    carbsGoal: carbsGoal,
                    fatsGoal: fatsGoal,
                    proteinsGoal: proteinsGoal,
                    sodiumGoal: sodiumGoal,
                    sugarsGoal: sugarsGoal,
                    days: days

                  });
                })

                .catch(err => console.log(err));
            }
          })

          .catch(err => console.log(err));

      } else {

        //if dashboard page get is requested, and there are no user goals to retrieve from, set to fda approved guidelines
        //also need if/else statements in here for Day transactions
        let caloriesGoal = 2000;
        let carbsGoal = 275;
        let proteinsGoal = 50;
        let fatsGoal = 78;
        let sugarsGoal = 37.5;
        let sodiumGoal = 2300;

        //we need to pull data from the requested date (or create a new Days instance), matches to both date AND email
        Days.findOne({ email: req.user.email, dateString: dateRequest.toDateString() })

          //if this user exists, and a Day exists for this date rerender the page with goals data and pass it in the Transactions for that date
          .then(days => {

            //if this user exists with this date, render the page with both the goals AND the transactions for that date
            if (days) {

              //render the dashboard page and pass in the Day, which should include the IDs for transactions for that date
              //also pass in the goals we set earlier
              res.render("dashboard", {
                name: req.user.name,
                caloriesGoal: caloriesGoal,
                carbsGoal: carbsGoal,
                fatsGoal: fatsGoal,
                proteinsGoal: proteinsGoal,
                sodiumGoal: sodiumGoal,
                sugarsGoal: sugarsGoal,
                days: days
              });

              //if this Day does not exist for that user, create new one
            } else {

              //we will create a new Day using a new instance of Day model, does not save
              const newDays = new Days({
                email: req.user.email,
                date: dateRequest,
                dateString: dateRequest.toDateString()
              });
              //save the Day in the DB
              newDays
                .save()

                //if days gets saved, render the dashboard page
                .then(days => {

                  //renders the dashboard page anytime this page gets called
                  res.render("dashboard", {
                    name: req.user.name,
                    caloriesGoal: caloriesGoal,
                    carbsGoal: carbsGoal,
                    fatsGoal: fatsGoal,
                    proteinsGoal: proteinsGoal,
                    sodiumGoal: sodiumGoal,
                    sugarsGoal: sugarsGoal,
                    days: days

                  });
                })

                .catch(err => console.log(err));
            }
          })

          .catch(err => console.log(err));
      }
    })

    .catch(err => console.log(err));
});

//routes to the resources page
router.get("/resources", ensureAuthenticated, (req, res) =>
  res.render("resources", {
    name: req.user.name
  })
);

//routes to the healthinsights page
router.get("/healthinsights", ensureAuthenticated, (req, res) =>
  res.render("healthinsights", {
    name: req.user.name
  })
);

//routes to biometrics page
router.get("/biometrics", ensureAuthenticated, (req, res) => {

  //current datetime
  let currentDate = new Date()

  //we need to pull data from the requested date (or create a new Days instance), matches to both date AND email
  Days.findOne({ email: req.user.email, dateString: currentDate.toDateString() })

    //if this user exists, and a Day exists for this date rerender the page with goals data and pass it in the Transactions for that date
    .then(days => {

      //if this user exists with this date, render the page with both the goals AND the transactions for that date
      if (days) {

        //render the dashboard page and pass in the Day, which should include the IDs for transactions for that date
        //also pass in the goals we set earlier
        res.render("biometrics", {
          name: req.user.name,
          days: days
        });

        //if this Day does not exist for that user, create new one
      } else {

        //we will create a new Day using a new instance of Day model, does not save
        const newDays = new Days({
          email: req.user.email,
          date: currentDate,
          dateString: currentDate.toDateString()
        });
        //save the Day in the DB
        newDays
          .save()

          //if days gets saved, render the dashboard page
          .then(days => {
            console.log(days);

            //renders the dashboard page anytime this page gets called
            res.render("biometrics", {
              name: req.user.name,
              days: days
            });
          })

          .catch(err => console.log(err));
      }
    })

    .catch(err => console.log(err));

});

//post request on the dashboard pulls in data from the database for a certain date
router.post("/biometrics", ensureAuthenticated, (req, res) => {

  //pull date from submitted request, turns into readable format using JS Date methods
  let parsedDate = Date.parse(req.body.date);
  let dateRequest = new Date(parsedDate);

  //we need to pull data from the requested date (or create a new Days instance), matches to both date AND email
  Days.findOne({ email: req.user.email, dateString: dateRequest.toDateString() })

    //if this user exists, and a Day exists for this date rerender the page with goals data and pass it in the Transactions for that date
    .then(days => {

      //if this user exists with this date, render the page with both the goals AND the transactions for that date
      if (days) {

        //render the dashboard page and pass in the Day, which should include the IDs for transactions for that date
        res.render("biometrics", {
          name: req.user.name,
          days: days
        });

        //if this Day does not exist for that user, create new one
      } else {

        //we will create a new Day using a new instance of Day model, does not save
        const newDays = new Days({
          email: req.user.email,
          date: dateRequest,
          dateString: dateRequest.toDateString()
        });
        //save the Day in the DB
        newDays
          .save()

          //if days gets saved, render the dashboard page
          .then(days => {

            console.log(days);

            //renders the dashboard page anytime this page gets called
            res.render("biometrics", {
              name: req.user.name,
              days: days

            });
          })

          .catch(err => console.log(err));
      }
    })

    .catch(err => console.log(err));

});

//exports the router function to be used in app
module.exports = router;
