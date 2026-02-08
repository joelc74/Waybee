module.exports = app => {
  const pago = require("../controllers/pago.controller.js");
  const router = require("express").Router();

  router.post("/", pago.create);
  router.get("/", pago.findAll);
  router.get("/:id", pago.findOne);
  router.put("/:id", pago.update);
  router.delete("/:id", pago.remove);

  app.use("/api/pago", router);
};
