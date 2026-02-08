module.exports = (app) => {
  const router = require("express").Router();
  const auth = require("../controllers/auth.controller");
  const requireJwt = require("../middleware/auth-jwt");

  // Login: devuelve token
  router.post("/login", auth.login);

  // Me: prueba token
  router.get("/me", requireJwt(), auth.me);

  app.use("/api/auth", router);
};
