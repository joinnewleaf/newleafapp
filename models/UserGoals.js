//this schema is going to allow users to update their goals in the database
const mongoose = require('mongoose');

//need to create a new Schema, using mongoose schema function
//we need to create a new schema, this will tell database what kinds of goals it should expect
//we need email to know which email is getting the goals posted
const UserGoalsSchema = new mongoose.Schema({
    email: {
        type: String,
        require: false
    },
    username: {
        type: String,
        require: false
    },
    caloriesGoal: {
        type: String,
        require: true
    },
    fatsGoal: {
        type: String,
        require: true
    },
    carbsGoal: {
        type: String,
        require: true
    },
    proteinsGoal: {
        type: String,
        require: true
    },
    sodiumGoal: {
        type: String,
        require: true
    },
    sugarsGoal: {
        type: String,
        require: true
    }
});

//create a model from our schema, we pass it model name User, and we pass it the schema we set
const UserGoals = mongoose.model('UserGoals', UserGoalsSchema);

//export this to be used in other files
module.exports = UserGoals;