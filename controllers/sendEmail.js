//will be a function exported and used when registering for the first time, or when selecting to get your email
//request is the simplest npm function to make http calls
var request = require("request");

//attempts to create variable for JSON Web Token (these are used to authenticaten access to an API)
//this jwt is specifically used to authenticate requests to Passkit API
var jwt = require("../config/retrievejwt");

function sendEmail() {
  //actually retrieve the jwt by running function retrievejwt within the imported script
  jwt = jwt.retrievejwt(); //this gets put in the function so a jwt is only called when we need it

  var options = {
    method: "PUT",
    url: "https://api-pass.passkit.net/v2/recoveryEmails/resend",
    headers: {
      "Postman-Token": "65a65a20-5471-4cfe-bbb3-e4c73fe53cea",
      "Cache-Control": "no-cache",
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: jwt
    }
  };
  body: [
    {
      passId: "3sU1Fy4EHaGYFp",
      newRecoveryEmail: "esch.brad@gmail.com"
    }
  ],
    request(options, function(error, response, body) {
      if (error) throw new Error(error);
      var jsonData = JSON.parse(body);
      console.log(body);
      console.log("Check email for your card");
    });
}

//export this to be used in other files
module.exports.sendEmail = sendEmail;
