// backend/routes/usuario.routes.js
module.exports = app => {
  const express = require("express");
  const router = express.Router();

  const usuario = require("../controllers/usuario.controller");
  const upload = require("../middleware/upload");

  // Create usuario (admite foto opcional en multipart: file)
  router.post("/", upload.single("file"), usuario.create);

  // Obtener usuarios
  router.get("/", usuario.findAll);

  // Obtener usuario por id
  router.get("/:id", usuario.findOne);

  // Update con multipart (email/teléfono) + foto opcional
  router.put("/:id", upload.single("file"), usuario.update);

  // Eliminar usuario
  router.delete("/:id", usuario.remove);

  app.use("/api/usuario", router);
};
