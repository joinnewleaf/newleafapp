//models are how we manage our database
//for mongoose, we need to create a schema which is how we tell mongodb what they should expect in the database cluster
//this step should take quite a bit of planning, can really affect how your application looks in the end

const mongoose = require('mongoose');

//need to create a new Schema, using mongoose schema function
//this is going to create a new user and tell the database what kind of user it should expect
//utilizes a json object format
//we are telling it we expect a name, an email, and a hashed password all in a string format
//also require a date (time)
//if it's not in this format it will not work
//date is a date data type, instead of required we set it to a default date, which is the current date
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    passID: {
        type: String,
        require: false
    },
    date: {
        type: Date,
        default: Date.now
    }
});

//create a model from our schema, we pass it model name User, and we pass it the schema we set
const User = mongoose.model('User', UserSchema);

//export this to be used in other files
module.exports = User;