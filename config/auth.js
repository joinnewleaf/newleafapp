//this file will ensure user is logged in and authenticated before accessing the dashboard
//this works as middleware to be called before loading a page
//any route we want protected, we will add this as middleware
module.exports = {
  ensureAuthenticated: function(req, res, next) {
    //if the user is signed in (validated using passport)
    if (req.isAuthenticated()) {
      return next();
    }

    //sends an error flash message and redirects to login page
    req.flash("error_msg", "Please log in to view this resource ");
    res.redirect("/users/login");
  }
};
