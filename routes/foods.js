//possibly going to be an AJAX route to the gov food API db

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

//test file to be passed in when rendering the food diary page
var usda = require('../controllers/usda.js');//replace test file with API requirements

//:foodsearch is a variable which will be requested every time we enter a char in the search bar
router.get("/:foodsearch", ensureAuthenticated, (req, res) => {

    //pull search data
    let foodToLookUp = req.params.foodsearch;

    // console.log("food search REQUEST = "+foodToLookUp);
    //call the usda food search endpoint; returns json object with list of foods
    //give it a callback to make things async
    //we pass it a value which will end up being the search results, then we print it
    usda.searchFood(foodToLookUp, function callback(data){
        // console.log("food search results = "+JSON.stringify(data));
        res.send(data)
    });
});

//:foodID is a variable which will be requested every time we enter a char in the search bar
router.get("/foodDetails/:fdcId", ensureAuthenticated, (req, res) => {

    //pull search data
    let foodIdToLookUp = req.params.fdcId;
    // console.log("food ID REQUEST = "+foodIdToLookUp);

    // call the usda food details endpoint; returns json object with list of details
    usda.searchFoodDetails(foodIdToLookUp, function callback(data){
        // console.log("food ID results = "+JSON.stringify(data));
        res.send(data)
    });
});

//exports the router function to be used in app
module.exports = router;
