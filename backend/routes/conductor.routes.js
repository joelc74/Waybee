module.exports = app => {
  const conductor = require("../controllers/conductor.controller.js");
  const upload = require("../middleware/upload.js");
  const router = require("express").Router();

  // Create nuevo conductor (opcional: file)
  router.post("/", upload.single("file"), conductor.create);

  // Obtener los conductores
  router.get("/", conductor.findAll);

  // Retrieve un conductor with id
  router.get("/:id", conductor.findOne);

  // Update un conductor por id
  router.put("/:id", conductor.update);

  // Delete un conductor por id
  router.delete("/:id", conductor.remove);

  app.use("/api/conductor", router);
};
