//will be a function exported and used when registering for the first time, or when selecting to get your email
//request is the simplest npm function to make http calls
var request = require("request");

//attempts to create variable for JSON Web Token (these are used to authenticaten access to an API)
//this jwt is specifically used to authenticate requests to Passkit API
var jwt = require("../config/retrievejwt"); //I have no idea if this needs to go outside or inside the functions

function sendEmail(email) {

  //actually retrieve the jwt by running function retrievejwt within the imported script
  var jwtAuth = jwt.retrievejwt(); //this gets put in the function so a jwt is only called when we need it

  var options = {
    method: "PUT",
    url: "https://api-pass.passkit.net/v2/recoveryEmails/resend",
    headers: {
      "Postman-Token": "65a65a20-5471-4cfe-bbb3-e4c73fe53cea",
      "Cache-Control": "no-cache",
      Authorization: jwtAuth
    },
    body: [
      {
        passId: "a0KR8C6UrvoCPA",
        newRecoveryEmail: email
      }
    ],
    json: true
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    console.log(body);
  });
}

//request a new pass when the user is registered
function createPass(email) {
  var jwtAuth = jwt.retrievejwt();
  console.log("jwt = " + jwtAuth);

  var options = {
    method: "POST",
    url: "https://api-pass.passkit.net/v2/passes",
    headers: {
      "Postman-Token": "341d3f59-651c-4783-ad87-480adb31804c",
      "Cache-Control": "no-cache",
      Authorization: jwtAuth
    },
    body: {
      templateName: "prototype5template",
      dynamicData: {
        calories: 2000,
        protein: "100 g",
        fats: "65 g",
        carbs: "250 g",
        lastMeal: 0
      },
      recoveryEmail: email,
      passbook: {
        bgColor: "#ffb6c1",
        labelColor: "#FFFFFF",
        fgColor: "#FFFFFF",
        userInfo: {}
      }
    },
    json: true
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);

    console.log("body = " + JSON.stringify(body, null, 4));
  });
}



//export this to be used in other files
module.exports.createPass = createPass;

//export this to be used in other files
module.exports.sendEmail = sendEmail;



// const request = require('request');

// _EXTERNAL_URL = 'https://test-proj-heroku.herokuapp.com/api/plans';

// const callExternalApiUsingRequest = (callback) => {
//     request(_EXTERNAL_URL, { json: true }, (err, res, body) => {
//     if (err) {
//         return callback(err);
//      }
//     return callback(body);
//     });
// }

// module.exports.callApi = callExternalApiUsingRequest;

// const apiCallFromRequest = require('./Request')
// const apiCallFromNode = require('./NodeJsCall')

// const http = require('http')

// http.createServer((req, res) => {
//         if(req.url === "/request"){
//             apiCallFromRequest.callApi(function(response){
//                 //console.log(JSON.stringify(response));
//                 res.write(JSON.stringify(response));
//                 res.end();
//             });
//         }
//         else if(req.url === "/node"){
//             apiCallFromNode.callApi(function(response){
//                 res.write(response);
//                 res.end();
//             });
//         }

//         // res.end();
// }).listen(3000);
