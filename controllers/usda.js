//going to use this file to create functions to run in the USDA nutrient database
//going to require this in the foods router

//will be a function exported and used when registering for the first time, or when selecting to get your email
//request is the simplest npm function to make http calls
var request = require("request");

//provide the search request
function searchFoodDetails(searchId, callback) {

    //set api key
    var apiKey = process.env.USDA_API_KEY

    var options = {
        method: 'GET',
        url: 'https://api.nal.usda.gov/fdc/v1/' + searchId,
        qs: { api_key: apiKey },
        headers:
        {
            'Postman-Token': '8e0ee126-2ec6-4d51-a35d-544156783978',
            'cache-control': 'no-cache'
        }
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);

        //parse the response
        var details = JSON.parse(body);

        let counter = 0;

        //initialize a string for each detail
        let str2 = {};

        //initialize empty json object
        var fullObjString = {
            "details": [
                {
                    "proteins": 0,
                    "fats": 0,
                    "carbs": 0,
                    "calories": 0,
                    "sugars": 0,
                    "sodium": 0
                }
            ]
        }


        //if the returned value has foodNutrients
        if (details['foodNutrients']) {

            //some of the energy calories get printed out twice so need to check the first one only
            let checkEnergy = true;

            //for each foodNutrient, check the value
            details['foodNutrients'].forEach(function (data) {
                if (typeof data != undefined) {

                    //grab the nutrient name
                    let str1 = data["nutrient"]["name"].toString();
                    str1 = str1.replace(/\\/g, '\\\\').replace(/\"/g, '\\"');//escapes any quotation marks

                    //check if string matches
                    switch (str1) {
                        case 'Protein':
                            str2 = (data["amount"]);
                            fullObjString['details'][0]['proteins'] = str2;
                            break;
                        case 'Total lipid (fat)':
                            str2 = (data["amount"]);
                            fullObjString['details'][0]['fats'] = str2;

                            break;
                        case 'Carbohydrate, by difference':
                            str2 = (data["amount"]);
                            fullObjString['details'][0]['carbs'] = str2;
                            break;
                        case 'Energy':

                            //only check if we havent yet
                            if (checkEnergy) {
                                str2 = (data["amount"]);
                                fullObjString['details'][0]['calories'] = str2;
                                checkEnergy = false;
                            } else {
                                //no longer need to check
                                console.log("no longer need to check")
                            }

                            break;
                        case 'Sugars, total including NLEA':
                            str2 = (data["amount"]);
                            fullObjString['details'][0]['sugars'] = str2;
                            break;
                        case 'Sodium, Na':
                            str2 = (data["amount"]);
                            fullObjString['details'][0]['sodium'] = str2;
                            break;
                    }

                    counter++;

                    //at the end of the string pass the object to the callback function
                    if (counter == details['foodNutrients'].length) {
                        callback(fullObjString);
                    }

                } else {
                    callback(fullObjString);
                }

            });


        } else {

            callback(fullObjString);
        }

    });

}


//provide the search request
function searchFood(search, callback) {

    //set api key
    var apiKey = process.env.USDA_API_KEY

    //sends url and request
    //got rid of content type
    var options = {
        method: 'POST',
        url: 'https://api.nal.usda.gov/fdc/v1/search',
        qs: { api_key: apiKey },
        headers:
        {
            'Postman-Token': '05620ff6-66a4-4079-9eb9-d0abfa0a8ccb',
            'cache-control': 'no-cache'
        },
        body: { generalSearchInput: "\'" + search + "\'" },
        json: true
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);

        var searchCounter = 0;
        var str1 = "";
        var str2 = "";
        var fullObjString = "{\"foods\": [";

        if (body['foods']) {

            //going to loop through the body and pull all the foods and ids
            body['foods'].forEach(function (data) {

                // get individual description 
                str1 = data['description'].toString();
                str1 = str1.replace(/\\/g, '\\\\').replace(/\"/g, '\\"');//to escape double quotes
                // get individual id
                str2 = data['fdcId'].toString();
                str2 = str2.replace(/\\/g, '\\\\').replace(/\"/g, '\\"');//to escape double quotes

                //add to object string
                fullObjString = fullObjString + "{\"description\": \"" + str1 + "\",\"fdcId\": \"" + str2 + "\"}";

                //if we finish the loop, return the search results
                if (searchCounter == body['foods'].length - 1) {
                    fullObjString = fullObjString + "]}";

                    let responseSearch = JSON.parse(fullObjString);

                    //return callback with the search results
                    callback(responseSearch);
                }
                else {
                    fullObjString = fullObjString + ",";
                }

                searchCounter++;
            });

        } else {
            callback({});
        }

    });

}

//export this to be used in other files
module.exports.searchFood = searchFood;

//export this to be used in other files
module.exports.searchFoodDetails = searchFoodDetails;