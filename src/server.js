const express = require("express");
const logger = require("../lib/log")(__filename);
const util = require("../lib/util");
const dbModule = require("../sequelize/db");
const session = require("express-session");
const pgModule = require("../database/postgres/pg");
const {
  resetPasswordEmail,
  createUser,
  deleteUser,
  loginUser,
  logoutUser,
  userResetPassword,
  createDatabase,
} = require("./routes/userRoutes");
const { database } = require("./routes/renderRoutes");
require("dotenv").config();
let server = null;
let app = null;

const arangoModule = require("../database/arango/arango");
const influxModule = require("../database/influx/influx");

let cleaner = null;

const getApp = () => {
  return app;
};

const startServer = async (portNumber) => {
  await dbModule.start();
  await pgModule.startPGDB();
  await arangoModule.startArangoDB();
  influxModule.startInflux();

  cleaner = await util.cleanAnonymous();

  return new Promise((resolve, reject) => {
    app = express();
    app.set("view engine", "ejs");
    app.use(express.json());
    app.use(express.static("public"));
    app.use(
      session({
        secret: process.env.SECRET,
        resave: true,
        saveUninitialized: false,
        rolling: true,
        cookie: {
          secure: false,
          maxAge: 1000 * 60 * 60 * 24 * 7,
        },
      })
    );
    app.set("view engine", "ejs");
    app.use(express.json());
    app.get("/", (req, res) => {
      res.render("welcome", { email: req.session.email });
    });
    app.get("/signin", (req, res) => {
      res.render("signin", { email: req.session.email });
    });
    app.get("/signup", (req, res) => {
      res.render("signup", { email: req.session.email });
    });
    app.get("/setPassword/:token", (req, res) => {
      res.render("setPassword", { email: req.session.email });
    });
    app.get("/resetPassword", (req, res) => {
      res.render("resetPassword", { email: req.session.email });
    });
    app.get("/tutorial/:database", database);
    app.post("/api/notifications", resetPasswordEmail);
    app.post("/api/users", createUser);
    app.delete("/api/users/:id", deleteUser);
    app.post("/api/session", loginUser);
    app.delete("/api/session", logoutUser);
    app.post("/api/passwordReset", userResetPassword);
    app.post("/api/createDatabase/:database", createDatabase);

    server = app.listen(portNumber, () => {
      resolve(app);
      logger.info(`Listening on portNumber ${portNumber}`);
    });
  });
};

const stopServer = () => {
  return new Promise((resolve, reject) => {
    cleaner.stop();
    dbModule.close();
    pgModule.closePGDB();
    arangoModule.closeArangoDB();
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
