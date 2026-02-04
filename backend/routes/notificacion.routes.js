module.exports = app => {
  const notificacion = require("../controllers/notificacion.controller.js");
   var upload = require('../multer/upload.js');

  var router = require("express").Router();

  //Create a new note
  router.post("/",upload.single('file'), notificacion.create);

  //Retrieve all note
  router.get("/", notificacion.findAll);

  //Retrieve a single note with id
  router.get("/:id", notificacion.findOne);

  //Update a note with id
  router.put("/:id", notificacion.update);

  //Delete a note with id
  router.delete("/:id", notificacion.delete);

  app.use('/api/notificacion', router);

};