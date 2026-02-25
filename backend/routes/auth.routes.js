module.exports = (app) => {
  const router = require("express").Router();
  const auth = require("../controllers/auth.controller");
  const requireJwt = require("../middleware/auth-jwt");

  // Multer middleware (subida de imagen)
  const upload = require("../middleware/upload");

  // Login: devuelve token
  router.post("/login", auth.login);

  // Registro SOLO usuario + subida opcional de imagen
  // Campo archivo: img_profile
  router.post("/register", upload.single("img_profile"), auth.register);

  // Me: prueba token
  router.get("/me", requireJwt(), auth.me);

  app.use("/api/auth", router);
};
