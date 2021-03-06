"use strict"
const express = require("express")
const path = require("path")
const favicon = require("serve-favicon")
const logger = require("morgan")
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")
const session = require("express-session")

const index = require("./routes/index")
const users = require("./routes/users")
const register = require("./routes/register")
const login = require("./routes/login")
const user = require("./lib/middleware/user")
const messages = require("./lib/messages")

const app = express()

// view engine setup
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(logger("dev"))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser("shoutbox"))
app.use(express.static(path.join(__dirname, "public")))
app.use(session({
  secret: "shoutbox",
  resave: false,
  saveUninitialized: true
}))
app.use(user)
app.use(messages)

app.use("/", index)
app.use("/users", users)
app.get("/register", register.form)
app.post("/register", register.submit)
app.get("/login", login.form)
app.post("/login", login.submit)
app.get("/logout", login.logout)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error("Not Found")
  err.status = 404
  next(err)
})

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get("env") === "development" ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render("error")
})

module.exports = app
