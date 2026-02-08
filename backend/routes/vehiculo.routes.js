module.exports = app => {
  const vehiculo = require("../controllers/vehiculo.controller.js");
  const upload = require("../middleware/upload.js");
  const router = require("express").Router();

  // Create a new vehiculo (opcional: file)
  router.post("/", upload.single("file"), vehiculo.create);

  // Retrieve all vehiculos
  router.get("/", vehiculo.findAll);

  // Retrieve a single vehiculo with id
  router.get("/:id", vehiculo.findOne);

  // Update a vehiculo with id
  router.put("/:id", vehiculo.update);

  // Delete a vehiculo with id
  router.delete("/:id", vehiculo.remove);

  app.use("/api/vehiculo", router);
};
