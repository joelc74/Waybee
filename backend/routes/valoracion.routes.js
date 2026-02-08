module.exports = app => {
  const valoracion = require("../controllers/valoracion.controller.js");
  const router = require("express").Router();

  router.post("/", valoracion.create);
  router.get("/", valoracion.findAll);
  router.get("/:id", valoracion.findOne);
  router.put("/:id", valoracion.update);
  router.delete("/:id", valoracion.remove);

  app.use("/api/valoracion", router);
};
