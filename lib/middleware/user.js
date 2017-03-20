"use strict"
const User = require("../user")

module.exports = function(req, res, next) {
  // get logged-in user ID from session
  const uid = req.session.uid
  if (!uid) return next()
  // get logged-in user's data from Redis
  User.get(uid, function(err, user) {
    if (err) return next(err)
    // expose user data to response object
    req.user = res.locals.user = user
    next()
  })
}