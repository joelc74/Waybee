module.exports = app => {
  const vehiculo = require("../controllers/vehiculo.controller.js");
  const upload = require("../middleware/upload.js");
  const router = require("express").Router();

  // Create nuevo vehiculo (opcional: file)
  router.post("/", upload.single("file"), vehiculo.create);

  // Obtener vehiculos
  router.get("/", vehiculo.findAll);

  // Obtener un vehiculo por id
  router.get("/:id", vehiculo.findOne);

  // Update un vehiculo por id
  router.put("/:id", vehiculo.update);

  // Delete un vehiculo por id
  router.delete("/:id", vehiculo.remove);

  app.use("/api/vehiculo", router);
};
