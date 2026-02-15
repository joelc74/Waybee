const router = require("express").Router();
const favorito = require("../controllers/favorito.controller");

// auth-jwt.js exporta una FACTORY -> hay que invocarla
const authjwt = require("../middleware/auth-jwt");
const verifytoken = authjwt();

router.get("/", verifytoken, favorito.list);
router.post("/", verifytoken, favorito.create);
router.delete("/:id", verifytoken, favorito.remove);

module.exports = router;
