//currently non functional, to bring back, need to go through all route files and uncomment to include passkit functions

//will be a function exported and used when registering for the first time, or when selecting to get your email
//request is the simplest npm function to make http calls
var request = require("request");

//attempts to create variable for JSON Web Token (these are used to authenticaten access to an API)
//this jwt is specifically used to authenticate requests to Passkit API
//var jwt = require("../config/retrievejwt"); //I have no idea if this needs to go outside or inside the functions

//this is getting required from the models folder
const User = require("../models/User");
const UserGoals = require("../models/UserGoals"); //allows us to register users and post on their goals db

// function sendEmail(email) {
//   //actually retrieve the jwt by running function retrievejwt within the imported script
//   var jwtAuth = jwt.retrievejwt(); //this gets put in the function so a jwt is only called when we need it

//   var options = {
//     method: "PUT",
//     url: "https://api-pass.passkit.net/v2/recoveryEmails/resend",
//     headers: {
//       "Postman-Token": "65a65a20-5471-4cfe-bbb3-e4c73fe53cea",
//       "Cache-Control": "no-cache",
//       Authorization: jwtAuth
//     },
//     body: [
//       {
//         passId: "a0KR8C6UrvoCPA",
//         newRecoveryEmail: email
//       }
//     ],
//     json: true
//   };

//   request(options, function (error, response, body) {
//     if (error) throw new Error(error);
//     console.log(body);
//   });
// }

//request a new pass when the user is registered
// function createPass(email) {
//   var jwtAuth = jwt.retrievejwt();

//   var options = {
//     method: "POST",
//     url: "https://api-pass.passkit.net/v2/passes",
//     headers: {
//       "Postman-Token": "341d3f59-651c-4783-ad87-480adb31804c",
//       "Cache-Control": "no-cache",
//       Authorization: jwtAuth
//     },
//     body: {
//       templateName: "New_Leaf_Template_3",
//       dynamicData: {
//         calories: 2000,
//         protein: "50 g",
//         fats: "78 g",
//         carbs: "275 g",
//         lastMeal: 0
//       },
//       recoveryEmail: email,
//       passbook: {
//         bgColor: "#85B291",
//         labelColor: "#FFFFFF",
//         fgColor: "#FFFFFF",
//         userInfo: {}
//       }
//     },
//     json: true
//   };

//   request(options, function (error, response, body) {
//     if (error) throw new Error(error);

//     //check if user created
//     User.findOne({ email: email })

//       //if this user exists, we update the passID; users is the variable that mongodb function returns
//       .then(users => {
//         if (users) {

//           // if user already exists, we update
//           User.updateOne(
//             { email: email },
//             {
//               passID: body.id
//             }
//           ).then(function () { //function runs asynchronously, so wait to render

//           });
//         }
//       });

//     return body.id;
//   });
// }

//still needs to exist because updates goals
//call this function every time goals are saved or a new food is saved to the diary
// function updatePass(email, days) {

//   //need to retrieve update information from the database; find user email
//   User.findOne({ email: email })

//     //if this user exists, we retrieve their passID and their Goals
//     .then(users => {
//       if (users) {

//         //if user already exists, need to pull in user's goals as well
//         UserGoals.findOne({ email: email })

//           //use this section to update card, need to also add a function to grab days diary
//           .then(usersgoals => {

//             //initialize total sums as global vars
//             var totalCalories = 0;
//             var totalCarbs = 0;
//             var totalFats = 0;
//             var totalProteins = 0;
//             var totalSodium = 0;
//             var totalSugars = 0;

//             //loop through each food, and for each food, total through all values
//             days.foods.forEach(function (element) {

//               console.log(element);

//               totalCalories += parseInt(element.calories);
//               totalCarbs += parseInt(element.carbs);
//               totalSugars += parseInt(element.sugars);
//               totalFats += parseInt(element.fats);
//               totalProteins += parseInt(element.proteins);
//               totalSodium += parseInt(element.sodium);

//             });

//             console.log(days);

//             //sets goals data on the page to what's stored in the db
//             let caloriesGoal = usersgoals.caloriesGoal;
//             let carbsGoal = usersgoals.carbsGoal;
//             let proteinsGoal = usersgoals.proteinsGoal;
//             let fatsGoal = usersgoals.fatsGoal;
//             let sugarsGoal = usersgoals.sugarsGoal;
//             let sodiumGoal = usersgoals.sodiumGoal;

//             //uses goals object imported from database
//             var updatedCaloriesGoal = caloriesGoal - totalCalories;
//             var updatedCarbsGoal = carbsGoal - totalCarbs;
//             var updatedProteinsGoal = proteinsGoal - totalProteins;
//             var updatedFatsGoal = fatsGoal - totalFats;

//             //actually retrieve the jwt by running function retrievejwt within the imported script
//             var jwtAuth = jwt.retrievejwt();

//             //ALWAYS GET RID OF CONTENT TYPE, this ends up not being a form
//             var options = {
//               method: 'PUT',
//               url: 'https://api-pass.passkit.net/v2/passes/' + users.passID,
//               headers:
//               {
//                 'Postman-Token': '651acda7-8203-4ae7-a850-7c0b211a83fe',
//                 'cache-control': 'no-cache',
//                 Authorization: jwtAuth
//               },

//               //do not forget to get rid of quotations!!!!
//               body: {
//                 dynamicData: {
//                   calories: updatedCaloriesGoal,
//                   protein: updatedProteinsGoal + " g",
//                   fats: updatedFatsGoal + " g",
//                   carbs: updatedCarbsGoal + " g",
//                   lastMeal: 0,
//                   restaurant: "None"
//                 }
//               },
//               json: true
//             };
//             request(options, function (error, response, body) {
//               if (error) throw new Error(error);

//               console.log(body);
//             });
//           })
//       }
//     });
// }

// //export this to be used in other files
// module.exports.createPass = createPass;

// //export this to be used in other files
// module.exports.sendEmail = sendEmail;

// //export this to be used in other files
// module.exports.updatePass = updatePass;
