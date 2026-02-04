module.exports = app => {
  const solicitud = require("../controllers/solicitud.controller.js");
  const router = require("express").Router();

  // Usuario crea solicitud (pool)
  router.post("/", solicitud.create);

  // Conductores listan pool
  router.get("/pool", solicitud.pool);

  // Conductor acepta solicitud (crea servicio y borra pool)
  router.post("/:id/accept", solicitud.accept);

  app.use("/api/solicitudes", router);
};
