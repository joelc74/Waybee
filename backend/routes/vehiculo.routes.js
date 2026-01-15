module.exports = app => {
  const vehiculo = require("../controllers/vehiculo.controller.js");
   var upload = require('../multer/upload.js');

  var router = require("express").Router();

  //Create a new Car
  router.post("/",upload.single('file'), vehiculo.create);

  //Retrieve all cars
  router.get("/", vehiculo.findAll);

  //Retrieve a single car with id
  router.get("/:id", vehiculo.findOne);

  //Update a car with id
  router.put("/:id", vehiculo.update);

  //Delete a car with id
  router.delete("/:id", vehiculo.delete);

  app.use('/api/vehiculo', router);

};