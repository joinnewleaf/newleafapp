//this schema is going to allow users to add food entries to their daily log
//Possibly will not use, currently not in use
const mongoose = require('mongoose');

//need to create a new Schema, using mongoose schema function
//we need email to know which user
//we need date to know which day
const TransactionsSchema = new mongoose.Schema({
    email: {
        type: String,
        require: true
    },
    date: {
        type: Date,
        require: true
    },
    time: {
        type: String,
        require: true
    },
    quantity: {
        type: Number,
        require: true
    },
    units: {
        type: String,
        require: true
    },
    calories: {
        type: Number,
        require: false
    },
    fats: {
        type: Number,
        require: false
    },
    proteins: {
        type: Number,
        require: false
    },
    carbs: {
        type: Number,
        require: false
    },
    fiber: {
        type: Number,
        require: false
    },
    sodium: {
        type: Number,
        require: false
    }
});

//create a model from our schema, we pass it model name Transactions, and we pass it the schema we set above
const Transactions = mongoose.model('Transactions', TransactionsSchema);

//export this to be used in other files
module.exports = Transactions;