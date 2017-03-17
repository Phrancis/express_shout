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

/*
Testing code below is for adding a test user to Redis. Follow these steps:
1) Start Redis server, e.g.: C:\Program Files\Redis\redis-server.exe
2) Uncomment the code below
2) Run from project root dir:
    node lib/user
3) Start Redis client, e.g.: C:\Program Files\Redis\redis-cli.exe
4) In redis-cli, get list of user IDs:
    GET user:ids
5) Use redis-cli to...
- get all hash keys and values:
    HGETALL user:1
- get all keys:
    HKEYS user:1
- get values for certain keys:
    HMGET user:1 name pass age id salt
- delete fields from Redis hash:
    HDEL key field [field ...]
- delete keys:
    DEL key [key ...]
- shutdown server:
    SHUTDOWN [NOSAVE|SAVE]
 */

// // TESTING CODE ONLY
// const phrancis = new User({
//   name: "Phrancis",
//   pass: "FizzBuzz42",
//   age: 33
// })
//
// phrancis.save(function(err) {
//   if (err) throw err
//   console.log(`user id ${phrancis.id}`)
// })