const db = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const Usuario = db.usuario;

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "email y password son obligatorios." });
    }

    const user = await Usuario.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: "Credenciales inválidas." });
    if (!user.activo) return res.status(403).json({ message: "Usuario inactivo." });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: "Credenciales inválidas." });

    const payload = {
      sub: user.id_usuario,
      role: user.rol,
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    return res.json({
      token,
      user: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      }
    });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Error en login." });
  }
};

// endpoint para probar el token fácilmente
exports.me = async (req, res) => {
  const { password_hash, ...safeUser } = req.user.toJSON();

  return res.json({
    jwt: req.jwt,
    user: safeUser
  });
};
