// backend/controllers/usuario.controller.js
const db = require("../models");
const bcrypt = require("bcrypt");

const Usuario = db.usuario;

exports.create = async (req, res) => {
  try {
    const body = req.body || {};

    if (!body.nombre || !body.email) {
      return res.status(400).json({ message: "nombre y email son obligatorios." });
    }

    // password: puedes enviar password (plano) o password_hash (ya hasheado)
    let password_hash = body.password_hash;
    if (!password_hash && body.password) {
      password_hash = await bcrypt.hash(body.password, 12);
    }
    if (!password_hash) {
      return res.status(400).json({ message: "password o password_hash es obligatorio." });
    }

    // ✅ si viene archivo (multipart), guardamos ruta en img_profile
    const img_profile = req.file?.filename ? `/images/${req.file.filename}` : null;

    const usuario = await Usuario.create({
      nombre: body.nombre,
      email: body.email,
      telefono: body.telefono || null,
      activo: body.activo ?? true,
      password_hash,
      rol: body.rol || "user",
      img_profile: img_profile || body.img_profile || null,
    });

    return res.status(201).json(usuario);
  } catch (e) {
    return res.status(500).json({ message: e.message || "Error creando usuario." });
  }
};

exports.findAll = async (req, res) => {
  try {
    const { q, rol, activo } = req.query;

    const where = {};
    if (rol) where.rol = rol;
    if (activo !== undefined) where.activo = String(activo) === "true";

    if (q) {
      where[db.Sequelize.Op.or] = [
        { nombre: { [db.Sequelize.Op.like]: `%${q}%` } },
        { email: { [db.Sequelize.Op.like]: `%${q}%` } },
      ];
    }

    const usuarios = await Usuario.findAll({ where });
    return res.json(usuarios);
  } catch (e) {
    return res.status(500).json({ message: e.message || "Error listando usuarios." });
  }
};

exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;
    const usuario = await Usuario.findByPk(id);
    if (!usuario) return res.status(404).json({ message: "Usuario no encontrado." });
    return res.json(usuario);
  } catch (e) {
    return res.status(500).json({ message: e.message || "Error obteniendo usuario." });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;

    // Con multipart, multer rellena req.body con strings
    const body = req.body || {};

    const usuario = await Usuario.findByPk(id);
    if (!usuario) return res.status(404).json({ message: "Usuario no encontrado." });

    // ✅ si llega archivo, actualizamos img_profile
    const newImgProfile = req.file?.filename ? `/images/${req.file.filename}` : null;

    // Si llega password, re-hash (aunque luego no lo uses en UI)
    if (body.password) {
      body.password_hash = await bcrypt.hash(body.password, 12);
      delete body.password;
    }

    // Construimos patch sin pisar campos si no vienen
    const patch = {};

    if (body.nombre !== undefined) patch.nombre = body.nombre;
    if (body.email !== undefined) patch.email = body.email;
    if (body.telefono !== undefined) patch.telefono = body.telefono;

    if (body.activo !== undefined) patch.activo = body.activo;
    if (body.rol !== undefined) patch.rol = body.rol;

    if (body.password_hash !== undefined) patch.password_hash = body.password_hash;

    // ✅ clave: solo si hay archivo
    if (newImgProfile) patch.img_profile = newImgProfile;

    await usuario.update(patch);

    return res.json(usuario);
  } catch (e) {
    return res.status(500).json({ message: e.message || "Error actualizando usuario." });
  }
};

exports.remove = async (req, res) => {
  try {
    const id = req.params.id;
    const usuario = await Usuario.findByPk(id);
    if (!usuario) return res.status(404).json({ message: "Usuario no encontrado." });

    await usuario.destroy();
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Error eliminando usuario." });
  }
};
