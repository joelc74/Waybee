module.exports = app => {
  const pago = require("../controllers/pago.controller.js");
   var upload = require('../multer/upload.js');

  var router = require("express").Router();

  //Create a new pay
  router.post("/",upload.single('file'), pago.create);

  //Retrieve all pay
  router.get("/", pago.findAll);

  //Retrieve a single pay with id
  router.get("/:id", pago.findOne);

  //Update a pay with id
  router.put("/:id", pago.update);

  //Delete a pay with id
  router.delete("/:id", pago.delete);

  app.use('/api/pago', router);

};