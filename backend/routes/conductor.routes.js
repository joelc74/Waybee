module.exports = app => {
  const conductor = require("../controllers/conductor.controller.js");
   var upload = require('../multer/upload.js');

  var router = require("express").Router();

  //Create a new driver
  router.post("/",upload.single('file'), conductor.create);

  //Retrieve all driver
  router.get("/", conductor.findAll);

  //Retrieve a single driver with id
  router.get("/:id", conductor.findOne);

  //Update a driver with id
  router.put("/:id", conductor.update);

  //Delete a driver with id
  router.delete("/:id", conductor.delete);

  app.use('/api/conductor', router);

};