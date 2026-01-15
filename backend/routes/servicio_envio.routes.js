module.exports = app => {
  const servicio_envio = require("../controllers/servicio_envio.controller.js");
   var upload = require('../multer/upload.js');

  var router = require("express").Router();

  //Create a new shipping service
  router.post("/",upload.single('file'), servicio_envio.create);

  //Retrieve all shipping service
  router.get("/", servicio_envio.findAll);

  //Retrieve a single shipping service with id
  router.get("/:id", servicio_envio.findOne);

  //Update a shipping service with id
  router.put("/:id", servicio_envio.update);

  //Delete a shipping service with id
  router.delete("/:id", servicio_envio.delete);

  app.use('/api/servicio_envio', router);

};