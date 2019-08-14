// this function is going to retrieve the goals using the user's email from the database
//currently not in use
const UserGoals = require("../models/UserGoals");

module.exports = function getGoals(email) {

    //we need to update the user goals if it already exists; we then need to temporarily store the original values, to check if they need changed
    UserGoals.findOne({ email: req.user.email })

        //if this user exists, we update the goals; usergoals is the variable that mongodb function returns
        .then(usergoals => {
            if (usergoals) {

                //parse out info from the goals
                caloriesGoal = usergoals.caloriesGoal;
                carbsGoal = usergoals.carbsGoal;
                proteinsGoal = usergoals.proteinsGoal;
                fatsGoal = usergoals.fatsGoal;
                sugarsGoal = usergoals.sugarsGoal;
                sodiumGoal = usergoals.sodiumGoal;

            } else { console.log('Cannot retrieve goals from database.') }
        })
}

//export this to be used in other files
module.exports = getGoals;