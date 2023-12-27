const addAppRoutes = (app) => {
  app.get("/", (req, res) => res.json("API Running!"));
  // define routes
  app.use("/api/users", require("./api/users"));
  app.use("/api/auth", require("./api/auth"));
  app.use("/api/profile", require("./api/profile"));
  app.use("/api/posts", require("./api/posts"));
  return app;
};

module.exports = addAppRoutes;
