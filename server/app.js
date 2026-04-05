const express = require("express");
const cors = require("cors");
const passport = require("passport");
const routes = require("./routes");
const { errorHandler, notFoundHandler } = require("./middlewares/errorHandler");
const { configurePassport } = require("./config/passport");

function createApp() {
  configurePassport();

  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
      credentials: true,
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(passport.initialize());

  app.get("/health", (req, res) => {
    res.json({ ok: true });
  });

  app.use("/api", routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
