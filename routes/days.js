// were going to use this anytime we need to read or write foods from the database

// we use express router to make this easy
const express = require("express");

// to create an express router, need to create a router using Router function in express
// this can now be used to listen to requests on the specified port
const router = express.Router();

// need to retrieve UserGoals model
const mongoose = require("mongoose");
const UserGoals = require("../models/UserGoals"); // allows us to register users and post on their goals db

// need to retrieve Days model
const Days = require("../models/Days"); // allows us to register users and post on their goals db

// must bring in our created passport authentication middleware to protect dashboard route
const { ensureAuthenticated } = require("../config/auth");

// self made functions found in controllers, likely want to replace with one big passkit library
// var passkit = require("../controllers/passkit"); //passkit function makes a request to passkit API

// post request on the dashboard adds in new data to diary
router.post("/add", ensureAuthenticated, (req, res) => {
  // pull important values out of the request
  const new_row_data = {
    name: req.body.food,
    calories: req.body.calories,
    carbs: req.body.carbs,
    fats: req.body.fats,
    proteins: req.body.proteins,
    sugars: req.body.sugar,
    sodium: req.body.sodium,
  };

  // insert new food into end of food array for each day
  // dateString needs to be trimmed because excess characters on edges
  Days.updateOne(
    {
      $or: [
        { $and: [{ email: req.user.email }, { email: { $ne: "" } }] },
        { username: req.user.username },
      ],
      dateString: req.body.dateString.trim(),
    },
    {
      $push: { foods: [new_row_data] },
    }
  )
    .then(() => {
      // query days
      Days.findOne({
        $or: [
          { $and: [{ email: req.user.email }, { email: { $ne: "" } }] },
          { username: req.user.username },
        ],
        dateString: req.body.dateString.trim(),
      }) //should properly check if either username or email match
        .then((days) => {
          if (days) {
            // also need to pull user goals
            // UserGoals.findOne({ email: req.user.email })
            UserGoals.findOne({
              $or: [
                { $and: [{ email: req.user.email }, { email: { $ne: "" } }] },
                { username: req.user.username },
              ],
            }) //should properly check if either username or email match

              // if this user exists, we render the page with the parameters already in the db
              .then((usergoals) => {
                // check if usersgoals exists in the database; if the user exists, we check if a Day exists for the current date
                if (usergoals) {
                  // to update pass, need to check if we are adding data for the current date
                  const checkcurrentDate = new Date();
                  const checkdateString = checkcurrentDate.toDateString();
                  // if (req.body.dateString.trim() == checkdateString) {
                  //     passkit.updatePass(req.user.email, days)
                  // }

                  // sets goals data on the page to what's stored in the db
                  const { caloriesGoal } = usergoals;
                  const { carbsGoal } = usergoals;
                  const { proteinsGoal } = usergoals;
                  const { fatsGoal } = usergoals;
                  const { sugarsGoal } = usergoals;
                  const { sodiumGoal } = usergoals;

                  // re render the dashboard after having updated the days collection
                  res.render("dashboard", {
                    name: req.user.name,
                    caloriesGoal,
                    carbsGoal,
                    fatsGoal,
                    proteinsGoal,
                    sodiumGoal,
                    sugarsGoal,
                    days,
                  });
                }
              })
              .catch((err) => console.log(err));
          } else {
            console.log("Days is undefined");
          }
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

// post request on the dashboard edits old data on the diary
router.post("/edit", ensureAuthenticated, (req, res) => {
  // have to turn string into a mongo object id
  const _id = mongoose.mongo.ObjectId(req.body.row_id);

  // how to update subdocuments within an array, finds the first element with matching id, and updates those using positional $
  Days.updateOne(
    { "foods._id": _id },
    {
      $set: {
        "foods.$.name": req.body.food,
        "foods.$.calories": req.body.calories,
        "foods.$.carbs": req.body.carbs,
        "foods.$.fats": req.body.fats,
        "foods.$.proteins": req.body.proteins,
        "foods.$.sugars": req.body.sugar,
        "foods.$.sodium": req.body.sodium,
      },
    }
  )
    .then((response) => {
      // query days
      Days.findOne({
        $or: [
          { $and: [{ email: req.user.email }, { email: { $ne: "" } }] },
          { username: req.user.username },
        ],
        dateString: req.body.dateString.trim(),
      }) //should properly check if either username or email match
        .then((days) => {
          // also need to pull user goals
          UserGoals.findOne({
            $or: [
              { $and: [{ email: req.user.email }, { email: { $ne: "" } }] },
              { username: req.user.username },
            ],
          })

            // if this user exists, we render the page with the parameters already in the db
            .then((usergoals) => {
              // check if usersgoals exists in the database; if the user exists, we check if a Day exists for the current date
              if (usergoals) {
                // to update pass, need to check if we are adding data for the current date
                const checkcurrentDate = new Date();
                const checkdateString = checkcurrentDate.toDateString();

                // next line commented out for passkit update
                // if (req.body.dateString.trim() == checkdateString) {
                //     passkit.updatePass(req.user.email, days)
                // }

                // sets goals data on the page to what's stored in the db
                const { caloriesGoal } = usergoals;
                const { carbsGoal } = usergoals;
                const { proteinsGoal } = usergoals;
                const { fatsGoal } = usergoals;
                const { sugarsGoal } = usergoals;
                const { sodiumGoal } = usergoals;

                // re render the dashboard after having updated the days collection
                res.render("dashboard", {
                  name: req.user.name,
                  caloriesGoal,
                  carbsGoal,
                  fatsGoal,
                  proteinsGoal,
                  sodiumGoal,
                  sugarsGoal,
                  days,
                });
              }
            })
            .catch((err) => console.log(err));
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

// delete row in the diary
router.post("/delete", ensureAuthenticated, (req, res) => {
  // have to turn string into a mongo object id
  const _id = mongoose.mongo.ObjectId(req.body.row_id);

  // how to delete subdocuments
  Days.updateOne({ "foods._id": _id }, { $pull: { foods: { _id } } })
    .then((response) => {
      // query days
      Days.findOne({
        $or: [
          { $and: [{ email: req.user.email }, { email: { $ne: "" } }] },
          { username: req.user.username },
        ],
        dateString: req.body.dateString.trim(),
      }) //should properly check if either username or email match
        .then((days) => {
          // also need to pull user goals
          //needs to be updated with username
          UserGoals.findOne({
            $or: [
              { $and: [{ email: req.user.email }, { email: { $ne: "" } }] },
              { username: req.user.username },
            ],
          })

            // if this user exists, we render the page with the parameters already in the db
            .then((usergoals) => {
              // check if usersgoals exists in the database; if the user exists, we check if a Day exists for the current date
              if (usergoals) {
                // to update pass, need to check if we are adding data for the current date
                const checkcurrentDate = new Date();
                const checkdateString = checkcurrentDate.toDateString();

                // next line commented out for passkit update
                // if (req.body.dateString.trim() == checkdateString) {
                //     passkit.updatePass(req.user.email, days)
                // }

                // sets goals data on the page to what's stored in the db
                const { caloriesGoal } = usergoals;
                const { carbsGoal } = usergoals;
                const { proteinsGoal } = usergoals;
                const { fatsGoal } = usergoals;
                const { sugarsGoal } = usergoals;
                const { sodiumGoal } = usergoals;

                // re render the dashboard after having updated the days collection
                //replace name with username
                res.render("dashboard", {
                  name: req.user.email,
                  caloriesGoal,
                  carbsGoal,
                  fatsGoal,
                  proteinsGoal,
                  sodiumGoal,
                  sugarsGoal,
                  days,
                });
              }
            })
            .catch((err) => console.log(err));
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

// delete Foods
router.post("/deleteMultipleFoods", ensureAuthenticated, (req, res) => {
  // extract id from request
  const _id = req.body.row_id;

  // split into array
  const _id_array = _id.split(",");

  let arrayCounter = 0;

  if (_id != "empty") {
    // for each element, do new delete request in db
    _id_array.forEach((element) => {
      // have to turn string into a mongo object id
      const _id_obj = mongoose.mongo.ObjectId(element);

      // delete all subdocuments in array
      Days.updateOne(
        { "foods._id": _id_obj },
        { $pull: { foods: { _id: _id_obj } } }
      )
        .then((response) => {
          // need to update the array counter after each request is completed
          arrayCounter++;

          // check if done updating array before sending response
          if (arrayCounter == _id_array.length) {
            // query days
            Days.findOne({
              $or: [
                { $and: [{ email: req.user.email }, { email: { $ne: "" } }] },
                { username: req.user.username },
              ],
              dateString: req.body.dateString.trim(),
            }) //should properly check if either username or email match
              .then((days) => {
                // also need to pull user goals
                UserGoals.findOne({
                  $or: [
                    {
                      $and: [{ email: req.user.email }, { email: { $ne: "" } }],
                    },
                    { username: req.user.username },
                  ],
                })

                  // if this user exists, we render the page with the parameters already in the db
                  .then((usergoals) => {
                    // check if usersgoals exists in the database; if the user exists, we check if a Day exists for the current date
                    if (usergoals) {
                      // to update pass, need to check if we are adding data for the current date
                      const checkcurrentDate = new Date();
                      const checkdateString = checkcurrentDate.toDateString();
                      // if (req.body.dateString.trim() == checkdateString) {
                      //     passkit.updatePass(req.user.email, days)
                      // }

                      // sets goals data on the page to what's stored in the db
                      const { caloriesGoal } = usergoals;
                      const { carbsGoal } = usergoals;
                      const { proteinsGoal } = usergoals;
                      const { fatsGoal } = usergoals;
                      const { sugarsGoal } = usergoals;
                      const { sodiumGoal } = usergoals;

                      // re render the dashboard after having updated the days collection
                      res.render("dashboard", {
                        name: req.user.email,
                        caloriesGoal,
                        carbsGoal,
                        fatsGoal,
                        proteinsGoal,
                        sodiumGoal,
                        sugarsGoal,
                        days,
                      });
                    }
                  })
                  .catch((err) => console.log(err));
              })
              .catch((err) => console.log(err));
          }
        })
        .catch((err) => console.log(err));
    });
  } else {
    // query days
    Days.findOne({
      $or: [
        { $and: [{ email: req.user.email }, { email: { $ne: "" } }] },
        { username: req.user.username },
      ],
      dateString: req.body.dateString.trim(),
    }) //should properly check if either username or email match
      .then((days) => {
        // also need to pull user goals
        UserGoals.findOne({
          $or: [
            { $and: [{ email: req.user.email }, { email: { $ne: "" } }] },
            { username: req.user.username },
          ],
        })

          // if this user exists, we render the page with the parameters already in the db
          .then((usergoals) => {
            // check if usersgoals exists in the database; if the user exists, we check if a Day exists for the current date
            if (usergoals) {
              // to update pass, need to check if we are adding data for the current date
              const checkcurrentDate = new Date();
              const checkdateString = checkcurrentDate.toDateString();

              // next line commented out for passkit update
              // if (req.body.dateString.trim() == checkdateString) {
              //     passkit.updatePass(req.user.email, days)
              // }

              // sets goals data on the page to what's stored in the db
              const { caloriesGoal } = usergoals;
              const { carbsGoal } = usergoals;
              const { proteinsGoal } = usergoals;
              const { fatsGoal } = usergoals;
              const { sugarsGoal } = usergoals;
              const { sodiumGoal } = usergoals;

              // re render the dashboard after having updated the days collection
              res.render("dashboard", {
                name: req.user.email,
                caloriesGoal,
                carbsGoal,
                fatsGoal,
                proteinsGoal,
                sodiumGoal,
                sugarsGoal,
                days,
              });
            }
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }
});

// Blood Pressure Diary Section
// post request on the dashboard adds in new data to diary
router.post("/addBP", ensureAuthenticated, (req, res) => {
  // pull important values out of the request
  const new_row_data = {
    time: req.body.time.toString(),
    systolicBP: req.body.systolicBP,
    diastolicBP: req.body.diastolicBP,
    heartRate: req.body.heartRate,
    notes: req.body.notes,
  };

  // insert new blood pressure into end of bp array for each day
  Days.updateOne(
    {
      $or: [
        { $and: [{ email: req.user.email }, { email: { $ne: "" } }] },
        { username: req.user.username },
      ],
      dateString: req.body.dateString.trim(),
    },
    {
      $push: { bloodPressures: [new_row_data] },
    }
  )
    .then(() => {
      // query days
      Days.findOne({
        $or: [
          { $and: [{ email: req.user.email }, { email: { $ne: "" } }] },
          { username: req.user.username },
        ],
        dateString: req.body.dateString.trim(),
      }) //should properly check if either username or email match
        .then((days) => {
          // re render the dashboard after having updated the days collection
          res.render("bodymetrics", {
            name: req.user.name,
            days,
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

// delete BP
router.post("/deleteBP", ensureAuthenticated, (req, res) => {
  // have to turn string into a mongo object id
  const _id = mongoose.mongo.ObjectId(req.body.row_id);

  // how to delete subdocuments
  Days.updateOne(
    { "bloodPressures._id": _id },
    { $pull: { bloodPressures: { _id } } }
  )
    .then((response) => {
      // query days
      Days.findOne({
        $or: [
          { $and: [{ email: req.user.email }, { email: { $ne: "" } }] },
          { username: req.user.username },
        ],
        dateString: req.body.dateString.trim(),
      }) //should properly check if either username or email match
        .then((days) => {
          // re render the dashboard after having updated the days collection
          res.render("bodymetrics", {
            name: req.user.email,
            days,
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

// delete BP
router.post("/deleteMultipleBP", ensureAuthenticated, (req, res) => {
  // extract id from request
  const _id = req.body.row_id;

  // split into array
  const _id_array = _id.split(",");

  let arrayCounter = 0;

  if (_id != "empty") {
    // for each element, do new delete request in db
    _id_array.forEach((element) => {
      // have to turn string into a mongo object id
      const _id_obj = mongoose.mongo.ObjectId(element);

      // delete all subdocuments in array
      Days.updateOne(
        { "bloodPressures._id": _id_obj },
        { $pull: { bloodPressures: { _id: _id_obj } } }
      )
        .then((response) => {
          // need to update the array counter after each request is completed
          arrayCounter++;

          // check if done updating array before sending response
          if (arrayCounter == _id_array.length) {
            // query days
            Days.findOne({
              $or: [
                { $and: [{ email: req.user.email }, { email: { $ne: "" } }] },
                { username: req.user.username },
              ],
              dateString: req.body.dateString.trim(),
            }) //should properly check if either username or email match
              .then((days) => {
                // re render the dashboard after having updated the days collection
                res.render("bodymetrics", {
                  name: req.user.name,
                  days,
                });
              })
              .catch((err) => console.log(err));
          }
        })
        .catch((err) => console.log(err));
    });
  } else {
    // query days
    // Days.findOne({
    //   email: req.user.email,
    //   dateString: req.body.dateString.trim(),
    // })
    Days.findOne({
      $or: [
        { $and: [{ email: req.user.email }, { email: { $ne: "" } }] },
        { username: req.user.username },
      ],
      dateString: req.body.dateString.trim(),
    }) //should properly check if either username or email match
      .then((days) => {
        // re render the dashboard after having updated the days collection
        res.render("bodymetrics", {
          name: req.user.name,
          days,
        });
      })
      .catch((err) => console.log(err));
  }
});

// post request on the dashboard edits old data on the diary
router.post("/editBP", ensureAuthenticated, (req, res) => {
  // have to turn string into a mongo object id
  const _id = mongoose.mongo.ObjectId(req.body.row_id);

  // how to update subdocuments within an array, finds the first element with matching id, and updates those using positional $
  Days.updateOne(
    { "bloodPressures._id": _id },
    {
      $set: {
        "bloodPressures.$.time": req.body.time.toString(),
        "bloodPressures.$.systolicBP": req.body.systolicBP,
        "bloodPressures.$.diastolicBP": req.body.diastolicBP,
        "bloodPressures.$.heartRate": req.body.heartRate,
        "bloodPressures.$.notes": req.body.notes,
      },
    }

    // want to query the foods for that day and pass them into the table/rerender the dashboard
  )
    .then((response) => {
      // query days
      Days.findOne({
        $or: [
          { $and: [{ email: req.user.email }, { email: { $ne: "" } }] },
          { username: req.user.username },
        ],
        dateString: req.body.dateString.trim(),
      }) //should properly check if either username or email match
        .then((days) => {
          // re render the dashboard after having updated the days collection
          res.render("bodymetrics", {
            name: req.user.email,
            days,
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

// weight log diary section
// post request on the dashboard adds in new data to diary
router.post("/addBodyWeight", ensureAuthenticated, (req, res) => {
  // pull important values out of the request
  const new_row_data = {
    time: req.body.time.toString(),
    bodyWeight: req.body.bodyWeight,
    notes: req.body.notes,
  };

  // insert new body weight into end of body weight array for each day
  Days.updateOne(
    {
      $or: [
        { $and: [{ email: req.user.email }, { email: { $ne: "" } }] },
        { username: req.user.username },
      ],
      dateString: req.body.dateString.trim(),
    },
    {
      $push: { bodyWeights: [new_row_data] },
    }
  )
    .then(() => {
      // query days
      Days.findOne({
        $or: [
          { $and: [{ email: req.user.email }, { email: { $ne: "" } }] },
          { username: req.user.username },
        ],
        dateString: req.body.dateString.trim(),
      }) //should properly check if either username or email match
        .then((days) => {
          // re render the dashboard after having updated the days collection
          res.render("bodymetrics", {
            name: req.user.email,
            days,
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

// delete BP
router.post("/deleteBodyWeight", ensureAuthenticated, (req, res) => {
  // have to turn string into a mongo object id
  const _id = mongoose.mongo.ObjectId(req.body.row_id);

  // how to delete subdocuments
  Days.updateOne(
    { "bodyWeights._id": _id },
    { $pull: { bodyWeights: { _id } } }
  )
    .then((response) => {
      // query days
      Days.findOne({
        $or: [
          { $and: [{ email: req.user.email }, { email: { $ne: "" } }] },
          { username: req.user.username },
        ],
        dateString: req.body.dateString.trim(),
      }) //should properly check if either username or email match, $ne is not equal
        .then((days) => {
          // re render the dashboard after having updated the days collection
          res.render("bodymetrics", {
            name: req.user.email,
            days,
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

// delete BP
router.post("/deleteMultipleBodyWeights", ensureAuthenticated, (req, res) => {
  // extract id from request
  const _id = req.body.row_id;

  // split into array
  const _id_array = _id.split(",");

  let arrayCounter = 0;

  if (_id != "empty") {
    // for each element, do new delete request in db
    _id_array.forEach((element) => {
      // have to turn string into a mongo object id
      const _id_obj = mongoose.mongo.ObjectId(element);

      // delete all subdocuments in array
      Days.updateOne(
        { "bodyWeights._id": _id_obj },
        { $pull: { bodyWeights: { _id: _id_obj } } }
      )
        .then((response) => {
          // need to update the array counter after each request is completed
          arrayCounter++;

          // check if done updating array before sending response
          if (arrayCounter == _id_array.length) {
            // query days
            Days.findOne({
              $or: [
                { $and: [{ email: req.user.email }, { email: { $ne: "" } }] },
                { username: req.user.username },
              ],
              dateString: req.body.dateString.trim(),
            }) //should properly check if either username or email match
              .then((days) => {
                //re render the dashboard after having updated the days collection
                res.render("bodymetrics", {
                  name: req.user.email,
                  days,
                });
              })
              .catch((err) => console.log(err));
          }
        })
        .catch((err) => console.log(err));
    });
  } else {
    // query days
    Days.findOne({
      $or: [
        { $and: [{ email: req.user.email }, { email: { $ne: "" } }] },
        { username: req.user.username },
      ],
      dateString: req.body.dateString.trim(),
    }) //should properly check if either username or email match
      .then((days) => {
        // re render the dashboard after having updated the days collection
        res.render("bodymetrics", {
          name: req.user.email,
          days,
        });
      })
      .catch((err) => console.log(err));
  }
});

// post request on the dashboard edits old data on the diary
router.post("/editBodyWeight", ensureAuthenticated, (req, res) => {
  // have to turn string into a mongo object id
  const _id = mongoose.mongo.ObjectId(req.body.row_id);

  // how to update subdocuments within an array, finds the first element with matching id, and updates those using positional $
  Days.updateOne(
    { "bodyWeights._id": _id },
    {
      $set: {
        "bodyWeights.$.time": req.body.time.toString(),
        "bodyWeights.$.bodyWeight": req.body.bodyWeight,
        "bodyWeights.$.notes": req.body.notes,
      },
    }

    // want to query the foods for that day and pass them into the table/rerender the dashboard
  )
    .then((response) => {
      // query days
      Days.findOne({
        $or: [
          { $and: [{ email: req.user.email }, { email: { $ne: "" } }] },
          { username: req.user.username },
        ],
        dateString: req.body.dateString.trim(),
      }) //should properly check if either username or email match
        .then((days) => {
          // re render the dashboard after having updated the days collection
          res.render("bodymetrics", {
            name: req.user.email,
            days,
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

// exercise diary section
// post request on the dashboard adds in new data to diary
router.post("/addExercise", ensureAuthenticated, (req, res) => {
  // pull important values out of the request
  const new_row_data = {
    exercise: req.body.exercise,
    minutes: req.body.minutes,
  };

  // insert new exercise into end of exercise array for each day
  // dateString needs to be trimmed because excess characters on edges
  Days.updateOne(
    {
      $or: [
        { $and: [{ email: req.user.email }, { email: { $ne: "" } }] },
        { username: req.user.username },
      ],
      dateString: req.body.dateString.trim(),
    },
    {
      $push: { exercises: [new_row_data] },
    }
  )
    .then(() => {
      // query days
      Days.findOne({
        $or: [
          { $and: [{ email: req.user.email }, { email: { $ne: "" } }] },
          { username: req.user.username },
        ],
        dateString: req.body.dateString.trim(),
      }) //should properly check if either username or email match
        .then((days) => {
          if (days) {
            // also need to pull user goals
            UserGoals.findOne({
              $or: [
                { $and: [{ email: req.user.email }, { email: { $ne: "" } }] },
                { username: req.user.username },
              ],
            })

              // if this user exists, we render the page with the parameters already in the db
              .then((usergoals) => {
                // check if usersgoals exists in the database; if the user exists, we check if a Day exists for the current date
                if (usergoals) {
                  // to update pass, need to check if we are adding data for the current date
                  const checkcurrentDate = new Date();
                  const checkdateString = checkcurrentDate.toDateString();
                  // if (req.body.dateString.trim() == checkdateString) {
                  //     passkit.updatePass(req.user.email, days)
                  // }

                  // sets goals data on the page to what's stored in the db
                  const { caloriesGoal } = usergoals;
                  const { carbsGoal } = usergoals;
                  const { proteinsGoal } = usergoals;
                  const { fatsGoal } = usergoals;
                  const { sugarsGoal } = usergoals;
                  const { sodiumGoal } = usergoals;

                  // re render the dashboard after having updated the days collection
                  res.render("dashboard", {
                    name: req.user.email,
                    caloriesGoal,
                    carbsGoal,
                    fatsGoal,
                    proteinsGoal,
                    sodiumGoal,
                    sugarsGoal,
                    days,
                  });
                }
              })
              .catch((err) => console.log(err));
          } else {
            console.log("Days is undefined");
          }
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

// post request on the dashboard edits old data on the diary
router.post("/editExercise", ensureAuthenticated, (req, res) => {
  // have to turn string into a mongo object id
  const _id = mongoose.mongo.ObjectId(req.body.row_id);

  // how to update subdocuments within an array, finds the first element with matching id, and updates those using positional $
  Days.updateOne(
    { "exercises._id": _id },
    {
      $set: {
        "exercises.$.exercise": req.body.exercise,
        "exercises.$.minutes": req.body.minutes,
      },
    }

    // want to query the foods for that day and pass them into the table/rerender the dashboard
  )
    .then((response) => {
      // query days
      Days.findOne({
        $or: [
          { $and: [{ email: req.user.email }, { email: { $ne: "" } }] },
          { username: req.user.username },
        ],
        dateString: req.body.dateString.trim(),
      }) //should properly check if either username or email match
        .then((days) => {
          // also need to pull user goals
          UserGoals.findOne({
            $or: [
              { $and: [{ email: req.user.email }, { email: { $ne: "" } }] },
              { username: req.user.username },
            ],
          })

            // if this user exists, we render the page with the parameters already in the db
            .then((usergoals) => {
              // check if usersgoals exists in the database; if the user exists, we check if a Day exists for the current date
              if (usergoals) {
                // to update pass, need to check if we are adding data for the current date
                const checkcurrentDate = new Date();
                const checkdateString = checkcurrentDate.toDateString();

                // next line commented out for passkit update
                // if (req.body.dateString.trim() == checkdateString) {
                //     passkit.updatePass(req.user.email, days)
                // }

                // sets goals data on the page to what's stored in the db
                const { caloriesGoal } = usergoals;
                const { carbsGoal } = usergoals;
                const { proteinsGoal } = usergoals;
                const { fatsGoal } = usergoals;
                const { sugarsGoal } = usergoals;
                const { sodiumGoal } = usergoals;

                // re render the dashboard after having updated the days collection
                res.render("dashboard", {
                  name: req.user.email,
                  caloriesGoal,
                  carbsGoal,
                  fatsGoal,
                  proteinsGoal,
                  sodiumGoal,
                  sugarsGoal,
                  days,
                });
              }
            })
            .catch((err) => console.log(err));
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

// delete row in the diary
router.post("/deleteExercise", ensureAuthenticated, (req, res) => {
  // have to turn string into a mongo object id
  const _id = mongoose.mongo.ObjectId(req.body.row_id);

  // how to delete subdocuments
  Days.updateOne({ "exercises._id": _id }, { $pull: { exercises: { _id } } })
    .then((response) => {
      // query days
      Days.findOne({
        $or: [
          { $and: [{ email: req.user.email }, { email: { $ne: "" } }] },
          { username: req.user.username },
        ],
        dateString: req.body.dateString.trim(),
      }) //should properly check if either username or email match
        .then((days) => {
          // also need to pull user goals
          UserGoals.findOne({
            $or: [
              { $and: [{ email: req.user.email }, { email: { $ne: "" } }] },
              { username: req.user.username },
            ],
          })

            // if this user exists, we render the page with the parameters already in the db
            .then((usergoals) => {
              // check if usersgoals exists in the database; if the user exists, we check if a Day exists for the current date
              if (usergoals) {
                // to update pass, need to check if we are adding data for the current date
                const checkcurrentDate = new Date();
                const checkdateString = checkcurrentDate.toDateString();

                // next line commented out for passkit update
                // if (req.body.dateString.trim() == checkdateString) {
                //     passkit.updatePass(req.user.email, days)
                // }

                // sets goals data on the page to what's stored in the db
                const { caloriesGoal } = usergoals;
                const { carbsGoal } = usergoals;
                const { proteinsGoal } = usergoals;
                const { fatsGoal } = usergoals;
                const { sugarsGoal } = usergoals;
                const { sodiumGoal } = usergoals;

                // re render the dashboard after having updated the days collection
                res.render("dashboard", {
                  name: req.user.email,
                  caloriesGoal,
                  carbsGoal,
                  fatsGoal,
                  proteinsGoal,
                  sodiumGoal,
                  sugarsGoal,
                  days,
                });
              }
            })
            .catch((err) => console.log(err));
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

// delete Foods
router.post("/deleteMultipleExercises", ensureAuthenticated, (req, res) => {
  // extract id from request
  const _id = req.body.row_id;

  // split into array
  const _id_array = _id.split(",");

  let arrayCounter = 0;

  if (_id != "empty") {
    // for each element, do new delete request in db
    _id_array.forEach((element) => {
      // have to turn string into a mongo object id
      const _id_obj = mongoose.mongo.ObjectId(element);

      // delete all subdocuments in array
      Days.updateOne(
        { "exercises._id": _id_obj },
        { $pull: { exercises: { _id: _id_obj } } }
      )
        .then((response) => {
          // need to update the array counter after each request is completed
          arrayCounter++;

          // check if done updating array before sending response
          if (arrayCounter == _id_array.length) {
            // query days
            Days.findOne({
              $or: [
                { $and: [{ email: req.user.email }, { email: { $ne: "" } }] },
                { username: req.user.username },
              ],
              dateString: req.body.dateString.trim(),
            }) //should properly check if either username or email match
              .then((days) => {
                // also need to pull user goals
                UserGoals.findOne({
                  $or: [
                    {
                      $and: [{ email: req.user.email }, { email: { $ne: "" } }],
                    },
                    { username: req.user.username },
                  ],
                })

                  // if this user exists, we render the page with the parameters already in the db
                  .then((usergoals) => {
                    // check if usersgoals exists in the database; if the user exists, we check if a Day exists for the current date
                    if (usergoals) {
                      // to update pass, need to check if we are adding data for the current date
                      const checkcurrentDate = new Date();
                      const checkdateString = checkcurrentDate.toDateString();
                      // if (req.body.dateString.trim() == checkdateString) {
                      //     passkit.updatePass(req.user.email, days)
                      // }

                      // sets goals data on the page to what's stored in the db
                      const { caloriesGoal } = usergoals;
                      const { carbsGoal } = usergoals;
                      const { proteinsGoal } = usergoals;
                      const { fatsGoal } = usergoals;
                      const { sugarsGoal } = usergoals;
                      const { sodiumGoal } = usergoals;

                      // re render the dashboard after having updated the days collection
                      res.render("dashboard", {
                        name: req.user.name,
                        caloriesGoal,
                        carbsGoal,
                        fatsGoal,
                        proteinsGoal,
                        sodiumGoal,
                        sugarsGoal,
                        days,
                      });
                    }
                  })
                  .catch((err) => console.log(err));
              })
              .catch((err) => console.log(err));
          }
        })
        .catch((err) => console.log(err));
    });
  } else {
    // query days
    Days.findOne({
      $or: [
        { $and: [{ email: req.user.email }, { email: { $ne: "" } }] },
        { username: req.user.username },
      ],
      dateString: req.body.dateString.trim(),
    }) //should properly check if either username or email match
      .then((days) => {
        // also need to pull user goals
        UserGoals.findOne({
          $or: [
            { $and: [{ email: req.user.email }, { email: { $ne: "" } }] },
            { username: req.user.username },
          ],
        })

          // if this user exists, we render the page with the parameters already in the db
          .then((usergoals) => {
            // check if usersgoals exists in the database; if the user exists, we check if a Day exists for the current date
            if (usergoals) {
              // to update pass, need to check if we are adding data for the current date
              const checkcurrentDate = new Date();
              const checkdateString = checkcurrentDate.toDateString();

              // next line commented out for passkit update
              // if (req.body.dateString.trim() == checkdateString) {
              //     passkit.updatePass(req.user.email, days)
              // }

              // sets goals data on the page to what's stored in the db
              const { caloriesGoal } = usergoals;
              const { carbsGoal } = usergoals;
              const { proteinsGoal } = usergoals;
              const { fatsGoal } = usergoals;
              const { sugarsGoal } = usergoals;
              const { sodiumGoal } = usergoals;

              // re render the dashboard after having updated the days collection
              res.render("dashboard", {
                name: req.user.email,
                caloriesGoal,
                carbsGoal,
                fatsGoal,
                proteinsGoal,
                sodiumGoal,
                sugarsGoal,
                days,
              });
            }
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err));
  }
});

//stress log diary section
// post request on the dashboard adds in new data to diary
router.post("/addStressLevel", ensureAuthenticated, (req, res) => {

  console.log(req.body);
  // pull important values out of the request
  const new_row_data = {
    time: req.body.time.toString(),
    stress: req.body.stress,
    notes: req.body.notes,
  };

  // insert new body weight into end of body weight array for each day
  Days.updateOne(
    {
      $or: [
        { $and: [{ email: req.user.email }, { email: { $ne: "" } }] },
        { username: req.user.username },
      ],
      dateString: req.body.dateString.trim(),
    },
    {
      $push: { stressLevels: [new_row_data] },
    }
  )
    .then(() => {
      // query days
      Days.findOne({
        $or: [
          { $and: [{ email: req.user.email }, { email: { $ne: "" } }] },
          { username: req.user.username },
        ],
        dateString: req.body.dateString.trim(),
      }) //should properly check if either username or email match
        .then((days) => {
          // re render the dashboard after having updated the days collection
          res.render("bodymetrics", {
            name: req.user.email,
            days,
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

// delete BP
router.post("/deleteStressLevel", ensureAuthenticated, (req, res) => {
  // have to turn string into a mongo object id
  const _id = mongoose.mongo.ObjectId(req.body.row_id);

  // how to delete subdocuments
  Days.updateOne(
    { "stressLevels._id": _id },
    { $pull: { stressLevels: { _id } } }
  )
    .then((response) => {
      // query days
      Days.findOne({
        $or: [
          { $and: [{ email: req.user.email }, { email: { $ne: "" } }] },
          { username: req.user.username },
        ],
        dateString: req.body.dateString.trim(),
      }) //should properly check if either username or email match, $ne is not equal
        .then((days) => {
          // re render the dashboard after having updated the days collection
          res.render("bodymetrics", {
            name: req.user.email,
            days,
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

// delete BP
router.post("/deleteMultipleStressLevels", ensureAuthenticated, (req, res) => {
  // extract id from request
  const _id = req.body.row_id;

  // split into array
  const _id_array = _id.split(",");

  let arrayCounter = 0;

  if (_id != "empty") {
    // for each element, do new delete request in db
    _id_array.forEach((element) => {
      // have to turn string into a mongo object id
      const _id_obj = mongoose.mongo.ObjectId(element);

      // delete all subdocuments in array
      Days.updateOne(
        { "stressLevels._id": _id_obj },
        { $pull: { stressLevels: { _id: _id_obj } } }
      )
        .then((response) => {
          // need to update the array counter after each request is completed
          arrayCounter++;

          // check if done updating array before sending response
          if (arrayCounter == _id_array.length) {
            // query days
            Days.findOne({
              $or: [
                { $and: [{ email: req.user.email }, { email: { $ne: "" } }] },
                { username: req.user.username },
              ],
              dateString: req.body.dateString.trim(),
            }) //should properly check if either username or email match
              .then((days) => {
                //re render the dashboard after having updated the days collection
                res.render("bodymetrics", {
                  name: req.user.email,
                  days,
                });
              })
              .catch((err) => console.log(err));
          }
        })
        .catch((err) => console.log(err));
    });
  } else {
    // query days
    Days.findOne({
      $or: [
        { $and: [{ email: req.user.email }, { email: { $ne: "" } }] },
        { username: req.user.username },
      ],
      dateString: req.body.dateString.trim(),
    }) //should properly check if either username or email match
      .then((days) => {
        // re render the dashboard after having updated the days collection
        res.render("bodymetrics", {
          name: req.user.email,
          days,
        });
      })
      .catch((err) => console.log(err));
  }
});

// post request on the dashboard edits old data on the diary
router.post("/editStressLevel", ensureAuthenticated, (req, res) => {
  // have to turn string into a mongo object id
  const _id = mongoose.mongo.ObjectId(req.body.row_id);

  // how to update subdocuments within an array, finds the first element with matching id, and updates those using positional $
  Days.updateOne(
    { "stressLevels._id": _id },
    {
      $set: {
        "stressLevels.$.time": req.body.time.toString(),
        "stressLevels.$.stress": req.body.stress,
        "stressLevels.$.notes": req.body.notes,
      },
    }

    // want to query the foods for that day and pass them into the table/rerender the dashboard
  )
    .then((response) => {
      // query days
      Days.findOne({
        $or: [
          { $and: [{ email: req.user.email }, { email: { $ne: "" } }] },
          { username: req.user.username },
        ],
        dateString: req.body.dateString.trim(),
      }) //should properly check if either username or email match
        .then((days) => {
          // re render the dashboard after having updated the days collection
          res.render("bodymetrics", {
            name: req.user.email,
            days,
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});


// exports the router function to be used in app
module.exports = router;
