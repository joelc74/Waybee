module.exports = app => {
  const usuario = require("../controllers/usuario.controller.js");
   var upload = require('../multer/upload.js');

  var router = require("express").Router();

  //Create a new usuario
  router.post("/",upload.single('file'), usuario.create);

  //Retrieve all usuario
  router.get("/", usuario.findAll);

  //Retrieve a single usuario with id
  router.get("/:id", usuario.findOne);

  //Update a usuario with id
  router.put("/:id", usuario.update);

  //Delete a usuario with id
  router.delete("/:id", usuario.delete);

  app.use('/api/usuario', router);

};