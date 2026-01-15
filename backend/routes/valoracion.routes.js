module.exports = app => {
  const valoracion = require("../controllers/valoracion.controller.js");
   var upload = require('../multer/upload.js');

  var router = require("express").Router();

  //Create a new assessment
  router.post("/",upload.single('file'), valoracion.create);

  //Retrieve all assessment
  router.get("/", valoracion.findAll);

  //Retrieve a single assessment with id
  router.get("/:id", valoracion.findOne);

  //Update a assessment with id
  router.put("/:id", valoracion.update);

  //Delete a assessment with id
  router.delete("/:id", valoracion.delete);

  app.use('/api/valoracion', router);

};