const xServerUtils = (() => {
  /** @type {import('express')} */
  const express = require("express");
  /** @type {import('express-validator')} */
  const expressValidator = require("express-validator");
  /** @type {import('request')} */
  const request = require("request");
  /** @type {import('bcryptjs')} */
  const bcrypt = require("bcryptjs");
  /** @type {import('jsonwebtoken')} */
  const jwt = require("jsonwebtoken");
  /** @type {import('config')} */
  const config = require("config");
  const middlewareAuth = require("../middleware/auth");
  return {
    xModules: {
      express,
      expressValidator,
      request,
      bcrypt,
      jwt,
      config,
      middlewareAuth,
    },
    /** @type {import('express')[]} */
    apps: [],
    /** @type {(ReturnType<import('express')['Router']>)[]} */
    routers: [],
    dbConnections: [],
    createApp(addAppRoutes, port = process.env.PORT || 5000) {
      const app = express();
      this.apps.push(app);
      app.use(express.json({ extended: false }));
      app.listen(port, () => console.log(`Server started on port ${port}`));
      if (typeof addAppRoutes === "function") {
        addAppRoutes(app);
      }
      return app;
    },
    createRouter() {
      this.routers.push(express.Router());
      return this.routers.slice(-1)[0];
    },
    responseError(res, err, status = 500) {
      if (status === 500) {
        console.error(`Server Error [${Date()}]:`, err?.message);
        res.status(500).send("Server Error");
        return;
      }
      res.status(status).json(err || "");
    },
    async connectMongoDB(uri = config.get("mongoURI")) {
      // e.g. uri: "mongodb://localhost:27017/local?retryWrites=true"
      const mongoose = require("mongoose");
      try {
        console.log("connect db: " + uri);
        this.dbConnections.push(await mongoose.connect(uri));
        console.log("MongoDB connected!!");
        return this.dbConnections.slice(-1)[0];
      } catch (err) {
        console.error(err.message);
        process.exit(1);
      }
    },
    async jwtSign(payload) {
      return new Promise((resolve, reject) => {
        jwt.sign(
          payload,
          config.get("jwtSecret"),
          { expiresIn: `${60}m` },
          (err, token) => {
            if (err) return reject(err);
            resolve({ token });
          },
        );
      });
    },
    async middlewareValidationResult(req, res, next) {
      const errors = expressValidator.validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  };
})();

module.exports = xServerUtils;
