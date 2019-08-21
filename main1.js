//calculate calories left today based on previous meal, set up function to read barcode
//reset pass at the beginning of each day to default
//calculate food for all quantities
//create request by restaurant to update their menu info in the data base
//allow restaurant to input their own nutrition info
//finally make this work for any registered restaurant
// MVP

//require creates a variable request 
var request = require("request");

//attempts to create variable for JSON Web Token (these are used to authenticaten access to an API)
//this jwt is specifically used to authenticate requests to Passkit API
//jwt var is equal to the function from another file in this folder, that retrieves the jwt
let jwt = require('./retrievejwt.js'); 
//actually retrieve the jwt by running function retrievejwt within the imported script
jwt = jwt.retrievejwt();

//imports database functions, sqlite 3 is specifically accessed ONLY on my computer
const  sqlite3 = require('sqlite3').verbose();
//opens sqlite database in file called main.db, connects to database
let db = new sqlite3.Database('main.db', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the SQlite database.');
});


//list of different functions to run
//retrievePass("db7dKA4y6e63up");
//listLocations();
//listPayments();
//updatePass();
//listCatalog();
//newRequestReceived();
//retrievePass("db7dKA4y6e63up");


//new request is received, triggered by scanning a user's barcode
//goes through series of functions and requests to update pass 
function newRequestReceived() {
    // var body = retrievePass("db7dKA4y6e63up");
    // newPass(body);
    //listLocations();
    listPayments();
    //updatePass();
    //listCatalog();
}


sendEmail();

//function is used to send a recovery email to the user, this is currently used to distribute passes
//to create a pass, this should be called upon user request for a pass, and after using the create pass function
//should only require email input, and passID after registering a pass
function sendEmail() {
    
    var options = { method: 'PUT',
      url: 'https://api-pass.passkit.net/v2/recoveryEmails/resend',
      headers: 
       { 'Postman-Token': '65a65a20-5471-4cfe-bbb3-e4c73fe53cea',
         'Cache-Control': 'no-cache',
         //'Content-Type': 'application/x-www-form-urlencoded',
         Authorization: jwt},
         body: 
            [{
              'passId':'3sU1Fy4EHaGYFp',
              'newRecoveryEmail':'esch.brad@gmail.com'
            }],
        json:true};

    request(options, function (error, response, body) {
        if (error) throw new Error(error);
        console.log(body);
        });
}

module.exports = {
    sendEmail:sendEmail
 }

//retrieves current pass details using pass ID, if pass is not registered, calls new pass function
//newPass function is passed into this function as a callback
function retrievePass(passID, callback) {

    var options = { method: 'GET',
    url: 'https://api-pass.passkit.net/v2/passes/'+passID,
    headers: 
    { 'Postman-Token': '95ef779f-f432-4d62-8c0e-9942cdb3d6de',
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: jwt } };

    request(options, function (error, response, body) {
    if (error) throw new Error(error);
    var jsonData = JSON.parse(body);

    //callback function is newPass
    callbackfunction(jsonData);
    });
}

//randomly use another function to call new pass, this is likely bad practice
function callbackfunction(jsonData){
    console.log("calling NewPass ");
    newPass(jsonData);
}



//listLocations function is used to log a new restaurant to the database
function listLocations() {

    //requests restaurant information from Square account
    var options = { method: 'GET',
    url: 'https://connect.squareup.com/v2/locations',
    headers: 
    { 'Postman-Token': '408bbfd2-3fc6-446c-9560-cebb53ed06b9',
        'Cache-Control': 'no-cache',
        Authorization: 'Bearer sq0atp-sZdtYHsHrwYHwuUGTbB3OQ' } };

    request(options, function (error, response, body) {
    if (error) throw new Error(error);
    var jsonData = JSON.parse(body);
    
    //calls newRestaurant function to record new information in database
    newRestaurant(jsonData);
    });
}

//called when a new sale is made at a Square reader, retrieves last payment details and calls getLastSale to store in DB
function listPayments() {

    var options = { method: 'GET',
    url: 'https://connect.squareup.com/v1/DJBCQ1D7WT5XM/payments',
    headers: 
    { 'Postman-Token': 'b45d65a3-79a2-407c-adbb-ab7e42277a2f',
        'Cache-Control': 'no-cache',
        Authorization: 'Bearer sq0atp-sZdtYHsHrwYHwuUGTbB3OQ' } };

    request(options, function (error, response, body) {
    if (error) throw new Error(error);

    var jsonData = JSON.parse(body);
    getLastSale(jsonData);
    });
}

//Retrieves previous purchase from square POS system, stores into variables for later decisions
function getLastSale(jsonData) {

//need length of transactions to determine what the most recent sale was, spits out every single transaction ever made, needs fixed
var jsonLength = jsonData.length;

//initialize array of foods purchased and ids
var foods_purchased = [];
var ids_purchased = [];

//cycle through payment list, ends at most recent sale
for(var i = 0;i< jsonData[jsonLength-1]['itemizations'].length;i++){
    
//      create array of food names, only for last purchase
        foods_purchased[i] = jsonData[jsonLength-1]['itemizations'][i]['name'];
        console.log(foods_purchased[i]);

//      create array of food ids in payments, IDs are given by the square system, needs to be matched via ID so menu matches the transaction
        ids_purchased[i] = jsonData[jsonLength-1]['itemizations'][i]['item_detail']['item_id'];
        console.log(ids_purchased[i]);
}

//we now have an array of foods and IDs, so we pass the updatePass function along with the array of IDs
//createTransaction will store it to our database
createTransaction(ids_purchased,updatePass);
}

//createTransaction function has an array of food IDs from the last purchase, and a callback to update the pass
function createTransaction(ids_purchased,callback) {

var id_array = ids_purchased;

//cycles through catalog for each ID, store to arrays, adds a transaction to SQLite database using last purchase data
for(var i = 0;i< id_array.length;i++){
    sql_command = "INSERT or REPLACE INTO transactions (foodID, customerID, passID)\
    VALUES (\""+String(id_array[i])+"\", \"db7dKA4y6e63up\", \"db7dKA4y6e63up\");";
    db.run(sql_command);
}

var track_rows = 0;
var query_results = [];

//attempts to check for food info in food database, matches to current purchase, then passes information to calculate pass update
for(var j = 0;j< id_array.length;j++){

//creates query for single row of last purchase
let sql = 'SELECT * FROM foods WHERE foodID=\''+String(id_array[j])+'\';';

//initialize meal values
protein = 0;
carbs = 0;
fats = 0;
calories = 0;

//prints out entire row (only one) for each row of ID j in last purchase
db.all(sql, [], (err, rows) => {

    if (err) {
      throw err;
    }
    rows.forEach((row) => {
        query_results[track_rows] = row;
        track_rows++;
        
        //check that for loop done, AND queries all made
        if (j==id_array.length&&track_rows == id_array.length) {

            //calls to add together query info as one entire meal
            addMealResults(query_results)           
        }
            });
        }
    );
}
}

//called from createTransaction within a for loop to add all foods in each meal together
function addMealResults(query_results) {

    //creates running sum of meal results
    for(var i = 0;i< query_results.length;i++){
        console.log(query_results[i].foodName);
        console.log(query_results[i].protein);
        console.log(query_results[i].carbs);
        console.log(query_results[i].fats);
        console.log(query_results[i].calories);

        protein = protein+query_results[i].protein;
        carbs = carbs+query_results[i].carbs;
        fats = fats+query_results[i].fats;
        calories = calories+query_results[i].calories;
    }

    //initialize beginning of loop, check if entered loop
    var j = 0;

    //needs while loop to check if end of adding results
    while (i<=query_results.length&&j==0) {

        //prints added results
        console.log("Totals:");
        console.log(protein);
        console.log(carbs);
        console.log(fats);
        console.log(calories);

        //when in loop, prevents infinite loop
        j=1;

        //call update pass, give pass ID/meal info
        updatePass();
    }
}

//function updates pass using new meal information
function updatePass() {

    var options = { method: 'PUT',
      url: 'https://api-pass.passkit.net/v2/passes/h1CVzMCPCvZm5k',
      headers: 
       { 'Postman-Token': 'f46189b7-6fb7-4864-ae4c-a8143ecb0390',
         'Cache-Control': 'no-cache',
         'Content-Type': 'application/json',
         Authorization: jwt },
      body: 
       { templateName: 'prototype5template',

       //dynamic data includes all information that gets updated on the front of the pass
       //this is where you choose what gets displayed
         dynamicData: 
          { calories: String(2000-calories),
            protein: String(protein)+" g",
            fats:String(fats)+" g",
            carbs:String(carbs)+" g",
            lastMeal:String(calories),
            lifestyle:"VGN, GF",
            restaurant: 'Brad Biz' },
         passbook: { bgColor: '#FFB6C1', labelColor: '000000', fgColor: '#FFFFFF' } },
      json: true };
    request(options, function (error, response, body) {
      if (error) throw new Error(error);
          var jsonData = JSON.parse(body);
      console.log(jsonData);  
    });  
}

//list catalog function returns the entire menu from the square API
//passes menu to store information in database to match to nturient info
function listCatalog() {

    var options = { method: 'GET',
    url: 'https://connect.squareup.com/v2/catalog/list',
    qs: { cursor: '', types: '' },
    headers: 
    { 'Postman-Token': '677c6769-dc36-4a96-ac6b-e046728927c1',
        'Cache-Control': 'no-cache',
        Authorization: 'Bearer sq0atp-sZdtYHsHrwYHwuUGTbB3OQ',
        'Content-Type': 'application/json',
        Accept: 'application/json' } };

    request(options, function (error, response, body) {
    if (error) throw new Error(error);

    var jsonData = JSON.parse(body);
    addFoodtoDatabase(jsonData);
    });

}

//function gets list of food items on square POS menu
// then stores to an array of foods and ids for the foods for adding nutrition facts
function addFoodtoDatabase(jsonData) {

//empty arrays
var foods = [];
var ids = [];
restaurantID = "";

//function is passed into getRestaurant ID function, probably bad practice but too confused on how js works 
function returnRestaurantID(rid) {
        restaurantID = rid;
        nextFunction();
};

//call getrestaurantID function and pass in a callback, this is used to match the restaurant menu to its ID in the database
getRestaurantID(returnRestaurantID);

//function is called from return restaurantID to keep things running in a specific order
function nextFunction() {

//cycle through catalog, store menu foods to database with IDs
for(var i = 0;i< jsonData['objects'].length-1;i++){
        foods[i] = jsonData['objects'][i+1]['item_data'].name;
        ids[i] = jsonData['objects'][i+1]['item_data']['variations'][0]['item_variation_data']['item_id'];
        sql_command = "INSERT or REPLACE INTO foods\
        VALUES (\""+String(ids[i])+"\", \""+String(foods[i])+"\", \"200\",\"15\",\"17\",\"16\",\""+restaurantID+"\", \""+String("date")+"\");";
        db.run(sql_command);
    }

//prints out all foods to verify SQL working properly
let sql = `SELECT * FROM foods`;
db.all(sql, [], (err, rows) => {
    if (err) {
      throw err;
    }
    rows.forEach((row) => {
      console.log(row);
    });
  });
}
}

//called from addFoodToDatabase function and has callback to keep order in tact, returns restaurantID
function getRestaurantID(callback) {

    var options = { method: 'GET',
    url: 'https://connect.squareup.com/v2/locations',
    headers: 
    { 'Postman-Token': '408bbfd2-3fc6-446c-9560-cebb53ed06b9',
        'Cache-Control': 'no-cache',
        Authorization: 'Bearer sq0atp-sZdtYHsHrwYHwuUGTbB3OQ' } };

    request(options, function (error, response, body) {
    if (error) throw new Error(error);

    var jsonData = JSON.parse(body);
    var restaurantID = jsonData['locations'][0]['id'];
    return callback(restaurantID);
    });
}

//function to add a new Restaurant into the database
function newRestaurant(jsonData) {

//gets all important retaurant info from square
var restaurantID = jsonData['locations'][0]['id'];
var name = jsonData['locations'][0]['name'];
var address = jsonData['locations'][0]['address'];
var address_line_1 = address['address_line_1'];
var locality = address['locality'];
var state = address['administrative_district_level_1'];
var PostalCode = address['postal_code'];
var country = jsonData['locations'][0]['country'];

//stores to restaurant table
 sql_command = "INSERT or REPLACE INTO restaurants\
 VALUES (\""+String(restaurantID)+"\", \""+String(name)+"\", \""+String(address_line_1)+"\",\""+String(locality)+"\",\""+String(state)+"\",\""+String(PostalCode)+"\",\""+String(country)+"\", \""+String(state)+"\");";
db.run(sql_command);

//prints out restaurant db to verify if it worked
let sql = `SELECT * FROM restaurants`;
db.all(sql, [], (err, rows) => {
    if (err) {
      throw err;
    }
    rows.forEach((row) => {
      console.log(row);
    });
  });

}

//when new pass is registered on users device, stores all customer information into database
function newPass(jsonData) {

    //collects pass ID from jsonData
    var passID = jsonData['id'];
    console.log("id is "+passID);

    //calls uniqueID function to create a randomized ID for a new customer
    var customerID = uniqueID();
    console.log("customer id is "+customerID);

    //replaces pass values in sqlite database to keep track of customer passes
    sql_command = "INSERT or REPLACE INTO passes\
    VALUES (\""+String(passID)+"\", \"2000\", \"100 g\",\"250 g\",\"65 g\",\"0\",\"2014-03-28\", \""+String(customerID)+"\");";
    db.run(sql_command);
    
    //print out entire pass database to show that pass was registered
    //performs dump by selecting all rows from passes and printing out each row
    let sql = `SELECT * FROM passes`;    
    db.all(sql, [], (err, rows) => {
      if (err) {
        throw err;
      }
      rows.forEach((row) => {
        console.log(row);
      });
    });
    }

//generates unique id for a newly registered pass
function uniqueID() {
    // Math.random should be unique because of its seeding algorithm.
    // Convert it to base 36 (numbers + letters), and grab the first 9 characters
    // after the decimal.
    return '_' + Math.random().toString(36).substr(2, 9);
    };
    
//function to close database after requests are complete
function closedb() {
// close the database connection
db.close((err) => {
    if (err) {
    return console.error(err.message);
    }
    console.log('Close the database connection.');
});
}