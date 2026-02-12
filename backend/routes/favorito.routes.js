const router = require("express").Router();
const favoritos = require("../controllers/favorito.controller");

const authJwt = require("../middleware/auth-jwt");

router.get("/", authJwt(), favoritos.list);
router.post("/", authJwt(), favoritos.create);
router.delete("/:id", authJwt(), favoritos.remove);

module.exports = router;
