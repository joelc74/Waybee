module.exports = app => {
  const servicio = require("../controllers/servicio.controller.js");
  const router = require("express").Router();

  // Crear servicio (entra al pool => estado=pendiente, id_conductor=null)
  router.post("/", servicio.create);

  // Pool (solo pendientes sin conductor)
  // GET /api/servicio/pool?tipo_servicio=viaje|envio
  router.get("/pool", servicio.pool);

  // Aceptar servicio (atómico)
  // POST /api/servicio/:id/accept  body: { id_conductor }
  router.post("/:id/accept", servicio.accept);

  // Cambiar estado (en_curso, completado, cancelado...)
  // PATCH /api/servicio/:id/estado body: { estado, precio_final? }
  router.patch("/:id/estado", servicio.setEstado);

  // Listar servicios (filtros por query)
  router.get("/", servicio.findAll);

  // Obtener uno
  router.get("/:id", servicio.findOne);

  // (Opcional) Update general si lo implementas
  // router.put("/:id", servicio.update);

  // Eliminar
  router.delete("/:id", servicio.remove);

  app.use("/api/servicio", router);
};
