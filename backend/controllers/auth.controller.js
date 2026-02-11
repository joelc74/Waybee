const db = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const Usuario = db.usuario;

function signToken(user) {
  const payload = {
    sub: user.id_usuario,
    role: user.rol,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

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

    const token = signToken(user);

    return res.json({
      token,
      user: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        img_profile: user.img_profile || null, // ✅
      },
    });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Error en login." });
  }
};

// ✅ Registro SOLO para usuarios (no conductores)
// ✅ Soporta multipart/form-data: req.file (img_profile) + req.body (resto)
exports.register = async (req, res) => {
  try {
    const { nombre, email, telefono, password } = req.body || {};

    if (!nombre || !email || !telefono || !password) {
      return res.status(400).json({
        message: "nombre, email, telefono y password son obligatorios.",
      });
    }

    const exists = await Usuario.findOne({ where: { email } });
    if (exists) {
      return res.status(409).json({ message: "Ya existe un usuario con ese email." });
    }

    const password_hash = await bcrypt.hash(password, 12);

    // ✅ Si se subió imagen, guardamos la ruta pública
    // index.js ya sirve: /images -> backend/public/images
    const img_profile = req.file ? `/images/${req.file.filename}` : null;

    const user = await Usuario.create({
      nombre: nombre.trim(),
      email: email.trim().toLowerCase(),
      telefono: String(telefono).trim(),
      activo: true,
      password_hash,
      fecha_registro: new Date(),
      rol: "user",
      img_profile, // ✅ NUEVO
    });

    const token = signToken(user);

    return res.status(201).json({
      token,
      user: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        img_profile: user.img_profile || null, // ✅
      },
    });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Error en registro." });
  }
};

// endpoint para probar el token fácilmente
exports.me = async (req, res) => {
  const { password_hash, ...safeUser } = req.user.toJSON();

  return res.json({
    jwt: req.jwt,
    user: safeUser,
  });
};
