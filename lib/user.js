"use strict"
const bcrypt = require("bcrypt")
const redis = require("redis")
// create long-running Redis connection
const db = redis.createClient()

module.exports = User

function User(obj) {
  // iterate keys in the object passed
  for (let key in obj) {
    // merge values
    this[key] = obj[key]
  }
}

User.prototype.save = function(fn) {
  // user exists
  if (this.id) {
    this.update(fn)
  } else {
    const user = this
    // create unique ID
    db.incr("user:ids", function(err, id) {
      if (err) return fn(err)
      // set ID so it'll be saved
      user.id = id
      user.hashPassword(function(err) {
        if (err) return fn(err)
        // save user properties
        user.update(fn)
      })
    })
  }
}

User.prototype.update = function(fn) {
  const user = this
  const id = user.id
  // index user ID by name
  db.set("user:id" + user.name, id, function(err) {
    if (err) return fn(err)
    // use Redis hash to store data
    db.hmset("user:" + id, user, function(err) {
      fn(err)
    })
  })
}

User.prototype.hashPassword = function(fn) {
  const user = this
  // generate a 12-character salt
  bcrypt.genSalt(12, function(err, salt) {
    if (err) return fn(err)
    // set salt so it'll be saved
    user.salt = salt
    // generate hash
    bcrypt.hash(user.pass, salt, function(err, hash) {
      if (err) return fn(err)
      // set hash so it'll be saved
      user.pass = hash
      fn()
    })
  })
}