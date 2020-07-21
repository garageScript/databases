const express = require("express");
const logger = require("../lib/log")(__filename);
const dbModule = require("../sequelize/db");
const session = require("express-session");
const {
  resetPasswordEmail,
  createUser,
  deleteUser,
  loginUser,
  logoutUser,
  userResetPassword,
  updateDBPassword,
} = require("./routes/userRoutes");

require("dotenv").config();
let server = null;
let app = null;

const getApp = () => {
  return app;
};

const startServer = async (portNumber) => {
  await dbModule.start();
  return new Promise((resolve, reject) => {
    app = express();
    app.set("view engine", "ejs");
    app.use(express.json());
    app.use(express.static("public"));
    app.use(
      session({
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: {
          secure: false,
          maxAge: 1000 * 60 * 5,
        },
      })
    );
    app.set("view engine", "ejs");
    app.use(express.json());
    app.get("/", (req, res) => {
      res.render("welcome", { username: req.session.username });
    });
    app.get("/signin", (req, res) => {
      res.render("signin", { username: req.session.username });
    });
    app.get("/setDBpassword", (req, res) => {
      res.render("setDBpassword", { username: req.session.username });
    });
    app.get("/signup", (req, res) => {
      res.render("signup", { username: req.session.username });
    });
    app.get("/setPassword/:token", (req, res) => {
      res.render("setPassword", { username: req.session.username });
    });
    app.get("/databases", (req, res) => {
      res.render("databases", { username: req.session.username });
    });
    app.get("/postgres", async (req, res) => {
      if (!req.session.username) return res.redirect("/");
      const { Accounts } = dbModule.getModels();
      const userAccount = await Accounts.findOne({
        where: {
          username: req.session.username,
        },
      });
      res.render("postgres", {
        username: req.session.username,
        dbPassword: userAccount.dbPassword,
      });
    });
    app.get("/resetPassword", (req, res) => {
      res.render("resetPassword", { username: req.session.username });
    });
    app.post("/api/notifications", resetPasswordEmail);
    app.post("/api/users", createUser);
    app.patch("/api/users/:id", updateDBPassword);
    app.delete("/api/users/:id", deleteUser);
    app.post("/api/session", loginUser);
    app.delete("/api/session", logoutUser);
    app.post("/api/passwordReset", userResetPassword);

    server = app.listen(portNumber, () => {
      resolve(app);
      logger.info(`Listening on portNumber ${portNumber}`);
    });
  });
};

const stopServer = () => {
  return new Promise((resolve, reject) => {
    dbModule.close();
    logger.info("DB has been closed");
    server.close(() => {
      logger.info("The server has been closed");
      resolve();
    });
  });
};

module.exports = {
  startServer,
  stopServer,
  getApp,
};
