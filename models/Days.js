//model should allow a transaction to be added to a day for a specific user
//we also need to include the goals set for that day, based on whatever the user has set
//when we route this we want to determine if a Days for the date has already been made
//if it wasnt made, we create a new one and send it the goals info for whatever is currently in the system
//this allows goals to be set by date
//this will be called everytime we save food to the database for a specific date

//this schema is going to allow users to add food entries to their daily log
//Possibly will not use, currently not in use
const mongoose = require('mongoose');

//need to create a new Schema, using mongoose schema function
//we need email to know which user
//we need date to know which day
//we will just append a transaction ID onto this schema
//since we query the exact date, going to store this as a string as well
const DaysSchema = new mongoose.Schema({
    email: {
        type: String,
        require: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    dateString: {
        type: String,
        require: true
    }
});

//create a model from our schema, we pass it model name Transactions, and we pass it the schema we set above
const Days = mongoose.model('Days', DaysSchema);

//export this to be used in other files
module.exports = Days;