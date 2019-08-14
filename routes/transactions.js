//we are going to use this route to update the dashboard and retrieve the date's diary data

//requiring all modules
const express = require("express");

//to create an express router, need to create a router using Router function in express
const router = express.Router();

//create a Transactions model, so we can call methods using mongoose
const Transactions = require("../models/Transactions");

//must bring in our created passport authentication middleware to protect who can create goals
const { ensureAuthenticated } = require("../config/auth");

//what still needs to happen here, is this needs to be a submitted form, when the save button is hit
//it should take in the date... and the req will contain the row data. This will check for the date in the database
//if the date exists, it will post on that date under that account name and append. if not it will create new

//this handles when users submit the date form, it should default to the current date, return and render the diary data
router.post("/date", ensureAuthenticated, (req, res) => {

    //pull date from the submitted form
    console.log(req.body)
    var date = req.body;

    //finds user transaction data based on both email AND date
    Transactions.find({ $and: [{ email: req.user.email }, { date: date }] })

        //if this user exists, we update the goals; usergoals is the variable that mongodb function returns
        .then(usergoals => {
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
                    { email: req.user.email },
                    {
                        caloriesGoal: caloriesGoal,
                        carbsGoal: carbsGoal,
                        fatsGoal: fatsGoal,
                        proteinsGoal: proteinsGoal,
                        sodiumGoal: sodiumGoal,
                        sugarsGoal: sugarsGoal
                    }
                ).then(function () { //function runs asynchronously, so wait to render

                    //push flash message to screen to show it is updated, need to also pass in as we render
                    success_msgs.push({ msg: "Goals updated" })

                    res.render("myaccount", {
                        success_msgs,
                        name: req.user.name,
                        caloriesGoal: caloriesGoal,
                        carbsGoal: carbsGoal,
                        fatsGoal: fatsGoal,
                        proteinsGoal: proteinsGoal,
                        sodiumGoal: sodiumGoal,
                        sugarsGoal: sugarsGoal
                    });

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
                    sugarsGoal = 37.5;
                }
                if (sodiumGoal.length == 0) {
                    sodiumGoal = 2300;
                }

                //if the user is new, we add new goals
                const newUserGoals = new UserGoals({
                    email: req.user.email,
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

                        //render the account page
                        res.render("myaccount", {
                            name: req.user.name,
                            caloriesGoal: caloriesGoal,
                            carbsGoal: carbsGoal,
                            fatsGoal: fatsGoal,
                            proteinsGoal: proteinsGoal,
                            sodiumGoal: sodiumGoal,
                            sugarsGoal: sugarsGoal
                        });
                    })

                    .catch(err => console.log(err));
            }
        });
});


//what needs to change here is we need to loop through transactions, and check what the request looks like
//when we loop through transactions, we might want to store to an array that gets rendered on the page.

//loads the page, and gets data from db every time page is rendered
router.get("/date", ensureAuthenticated, (req, res) => {

    //pull date from the submitted form
    console.log(req.body);
    var date = req.body;

    //finds user transaction data based on both email AND date
    Transactions.find({ $and: [{ email: req.user.email }, { date: date }] })

        //if this user exists, we render the page with the parameters already in the db
        .then(transactions => {

            //check if transactions for that date exists in the database
            if (transactions) {

                //maybe this should loop through the transactions list
                let transactions_1 = transactions.transactions1;

                //renders the dashboard page anytime this page gets called
                res.render("dashboard", {
                    name: req.user.name,
                    transactions: transactions
                });

            } else {

                //if dashboard page is requested, and there are no transactions to retrieve, set to empty array, so we have a blank table
                let transactions_1 = [];

                //render the account page
                res.render("dashboard", {
                    name: req.user.name,
                    transactions: transactions
                });

            }
        })
});


//exports the router function to be used in app
module.exports = router;
