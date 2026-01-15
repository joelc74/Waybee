module.exports = app => {
  const servicio_viaje = require("../controllers/servicio_viaje.controller.js");
   var upload = require('../multer/upload.js');

  var router = require("express").Router();

  //Create a new travel service
  router.post("/",upload.single('file'), servicio_viaje.create);

  //Retrieve all travel service
  router.get("/", servicio_viaje.findAll);

  //Retrieve a single travel service with id
  router.get("/:id", servicio_viaje.findOne);

  //Update a travel service with id
  router.put("/:id", servicio_viaje.update);

  //Delete a travel service with id
  router.delete("/:id", servicio_viaje.delete);

  app.use('/api/servicio_viaje', router);

};