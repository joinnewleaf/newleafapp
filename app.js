//this is your main entry point into the application
//to run use "npm run dev" as specified in package.json

//requiring express allows you to perform routes with node
const express = require("express");

//this is for creating a user interface in ejs
//needs middleware in app.use after the app is declared
const expressLayouts = require("express-ejs-layouts");

//need mongoose to actually connect to the mongo database
//we use a config file to actually set up the route to the database
//config file is keys.js
//we actually require it within the app
const mongoose = require("mongoose");

//configure the database using mongoose, config file is in the confige folder (keys.js)
//we are requiring the object found in the keys file, we access it using Mongo.URI, and we store it in db to connect to mongo
// const db = require("./config/keys").MongoURI;

//flash is middleware that is used for creating and handling flash messages on html page (used to flash that user is registered without rerendering the page)
const flash = require("connect-flash");
//express session is middleware used for managing user sessions
const session = require("express-session");

//requires actual passport from passport website
const passport = require("passport");
//require passport.js config in app file, used for passport middleware, specifically are requiring the passport function
require("./config/passport")(passport);

//load anything in a file calls .env into an environment variable
require("dotenv").config();

//load env variables
const MONGO_DB_URI = process.env.MONGO_DB_URI

//actually connecting to the mongo database using the above db variable, need the second parameter to prevent a warning
//this returns a promise so need to do a .then
//a promise represents a completion or a failure of an asynchronous object
//.then returns a promise, takes a callback for a success or failure
mongoose
  .connect(MONGO_DB_URI, { useNewUrlParser: true })
  .then(() => console.log("Mongo DB connected"))

  //catch lets you handle an error
  .catch(err => console.log(err));

//initializes app variable with express, app is the name and just creates an instance of express
//that can be used for routing
const app = express();

//giving client access to public folder for CSS, external files, etc.
app.use(express.static(__dirname + '/public'));

//setting up the EJS view engine, uses the layouts functions in express
//set is for using the actual view engine
app.use(expressLayouts);
app.set("view engine", "ejs");

//we are setting up the bodyParser middleware which allows us to get data from the form using request.body
app.use(express.urlencoded({ extended: false }));

//setting up an express session middleware, found on express website
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
  })
);

//setting up passport middleware, must go after the express session
app.use(passport.initialize());
app.use(passport.session());

//flash middleware
app.use(flash());

//global vars for flash, we pass a success message through flash to display in the rendered html
//this middleware gets called in another function, which is why we use next
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

//this is where we set up the routing environment
//use takes the express app instance, uses the '/' get route we put in the index.js file in the routes folder
app.use("/", require("./routes/index"));

//same thing as the above use function, instead this grabs the login/registration functions in the users file in the routes
//apparently these are performing routes themselves
//can go to localhost5000/users/login to access these from the browser
app.use("/users", require("./routes/users"));
app.use("/usergoals", require("./routes/usergoals"));//added this to allow the users goal route
app.use("/days", require("./routes/days"));//used to write to the db collection days
app.use("/foods", require("./routes/foods"));//potentially used to search gov database for foods


//creates an instance of a port that can be used for listening, process.env.PORT is used for
//deploying, eg. Heroku uses this as a default port, 5000 is used for local hosting and development
const PORT = process.env.PORT || 5000;

//calls express function listen, passes it the port we are using from PORT variable
//this function runs a server, and listens through the specified port
//${PORT} passes variable into console string
app.listen(PORT, console.log(`Server started on port ${PORT}`)); //backticks allow for template strings, which allow for embedded vars (contain placeholders)
