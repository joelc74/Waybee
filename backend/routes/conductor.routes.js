module.exports = app => {
  const conductor = require("../controllers/conductor.controller.js");
  const upload = require("../middleware/upload.js");
  const router = require("express").Router();

  // Create a new conductor (opcional: file)
  router.post("/", upload.single("file"), conductor.create);

  // Retrieve all conductores
  router.get("/", conductor.findAll);

  // Retrieve a single conductor with id
  router.get("/:id", conductor.findOne);

  // Update a conductor with id
  router.put("/:id", conductor.update);

  // Delete a conductor with id
  router.delete("/:id", conductor.remove);

  app.use("/api/conductor", router);
};
