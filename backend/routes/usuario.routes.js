module.exports = app => {
  const usuario = require("../controllers/usuario.controller.js");
  const upload = require("../middleware/upload.js");
  const router = require("express").Router();

  // Create a new usuario (opcional: file)
  router.post("/", upload.single("file"), usuario.create);

  // Retrieve all usuarios
  router.get("/", usuario.findAll);

  // Retrieve a single usuario with id
  router.get("/:id", usuario.findOne);

  // Update a usuario with id
  router.put("/:id", usuario.update);

  // Delete a usuario with id
  router.delete("/:id", usuario.remove);

  app.use("/api/usuario", router);
};
