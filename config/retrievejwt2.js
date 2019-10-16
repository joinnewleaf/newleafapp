//function is used to return a jwt to authorize access to Passkit API
function retrievejwt() {
    var request = require("request");
    var btoa = require("btoa"); //npm function that turns binary to ascii
    var CryptoJS = require("crypto-js"); //another npm library, must be required
  
    var apiKey = "uTispMXWJPFTdERIehpEtlCwdNJYFwVX",
      apiSecret =
        "sTyd7uowGBLtD4CwCceUXwrs5b1HoWJCjDMdBFuFNhmxmKwh9xfSyc0M9BCfHTYmn3QMq6txDF90OohFYwNjdmRu7glVHL5CTEu0RjkfCfKSEqSk54GExLXVeCh2lcO4";
  
    var jwtBody = {
      key: apiKey,
      exp: Math.floor(new Date().getTime() / 1000) + 30,
      iat: Math.floor(new Date().getTime() / 1000),
      url: request.url,
      method: request.method
    };
  
    if (
      request.hasOwnProperty("data") &&
      request.data !== null &&
      request.data.length > 0
    ) {
      jwtBody.signature = CryptoJS.SHA256(request.data).toString(
        CryptoJS.enc.Hex
      );
    }
  
    var jwt = "PKAuth " + generateJWT(jwtBody, apiSecret);
  
    function generateJWT(body, secret) {
      header = {
        alg: "HS256",
        typ: "JWT"
      };
      var token = [];
      token[0] = base64url(JSON.stringify(header));
      token[1] = base64url(JSON.stringify(body));
      token[2] = genTokenSign(token, secret);
  
      return token.join(".");
    }
  
    function genTokenSign(token, secret) {
      if (token.length != 2) {
        return;
      }
      var hash = CryptoJS.HmacSHA256(token.join("."), secret);
      var base64Hash = CryptoJS.enc.Base64.stringify(hash);
      return urlConvertBase64(base64Hash);
    }
  
    function base64url(input) {
      var base64String = btoa(input);
      return urlConvertBase64(base64String);
    }
  
    function urlConvertBase64(input) {
      var output = input.replace(/=+$/, "");
      output = output.replace(/\+/g, "-");
      output = output.replace(/\//g, "_");
  
      return output;
    }
  
    return jwt;
  }
  
  module.exports.retrievejwt = retrievejwt;
  