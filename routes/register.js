"use strict"
const User = require("../lib/user")

exports.form = function(req, res) {
  res.render("register", { title: "Register" })
}

exports.submit = function(req, res, next) {
  const data = req.body.user
  // check if user name is unique
  User.getByName(data.name, function(err, user) {
    // defer DB connection and other errors
    if (err) return next(err)
    // Redis will default it
    if(user.id) {
      res.error("Username already taken!")
      res.redirect("back")
    } else {
      // create new user using POST data
      user = new User({
        name: data.name,
        pass: data.pass
      })
      // save new user
      user.save(function(err) {
        if (err) return next(err)
        // store uid for authentication
        req.session.uid = user.id
        // redirect to entry listing page
        res.redirect("/")
      })
    }
  })
}