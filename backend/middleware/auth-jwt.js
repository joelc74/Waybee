const jwt = require("jsonwebtoken");
const db = require("../models");

module.exports = (opts = {}) => {
  const { roles } = opts;

  return async (req, res, next) => {
    const h = req.headers.authorization || "";

    if (!h.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Bearer token requerido." });
    }

    const token = h.slice(7);

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);

      const user = await db.usuario.findByPk(payload.sub);
      if (!user) return res.status(401).json({ message: "Token inválido." });
      if (!user.activo) return res.status(403).json({ message: "Usuario inactivo." });

      // Control de roles opcional
      if (roles && Array.isArray(roles) && roles.length > 0) {
        if (!roles.includes(user.rol)) {
          return res.status(403).json({ message: "No autorizado." });
        }
      }

      req.jwt = payload;
      req.user = user;
      return next();
    } catch (e) {
      return res.status(401).json({ message: "Token inválido o expirado." });
    }
  };
};
