const db = require("../models");
const bcrypt = require("bcrypt");

const Usuario = db.usuario;
const Conductor = db.conductor;

exports.create = async (req, res) => {
  const t = await db.sequelize.transaction();

  try {
    const body = req.body || {};

    if (!body.nombre || !body.email) {
      await t.rollback();
      return res.status(400).json({ message: "nombre y email son obligatorios." });
    }

    let password_hash = body.password_hash;
    if (!password_hash && body.password) {
      password_hash = await bcrypt.hash(body.password, 12);
    }
    if (!password_hash) {
      await t.rollback();
      return res.status(400).json({ message: "password o password_hash es obligatorio." });
    }

    const img_profile = req.file?.filename ? `/images/${req.file.filename}` : null;

    const rolRaw = body.rol;
    const rolNorm = String(rolRaw ?? "user").trim().toLowerCase();
    const rolFinal = (rolNorm === "user" || rolNorm === "driver" || rolNorm === "admin") ? rolNorm : "user";

    const usuario = await Usuario.create({
      nombre: body.nombre,
      email: body.email,
      telefono: body.telefono || null,
      activo: body.activo ?? true,
      password_hash,
      rol: rolFinal,
      img_profile: img_profile || body.img_profile || null,
    }, { transaction: t });

    if (usuario.rol === "driver") {
      await Conductor.create({
        id_usuario: usuario.id_usuario
      }, { transaction: t });
    }

    await t.commit();
    return res.status(201).json(usuario);

  } catch (e) {
    await t.rollback();
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
    const body = req.body || {};

    const usuario = await Usuario.findByPk(id);
    if (!usuario) return res.status(404).json({ message: "Usuario no encontrado." });

    const newImgProfile = req.file?.filename ? `/images/${req.file.filename}` : null;

    if (body.password) {
      body.password_hash = await bcrypt.hash(body.password, 12);
      delete body.password;
    }

    const patch = {};

    if (body.nombre !== undefined) patch.nombre = body.nombre;
    if (body.email !== undefined) patch.email = body.email;
    if (body.telefono !== undefined) patch.telefono = body.telefono;

    if (body.activo !== undefined) patch.activo = body.activo;

    if (body.rol !== undefined) {
      const rolNorm = String(body.rol ?? "user").trim().toLowerCase();
      patch.rol = (rolNorm === "user" || rolNorm === "driver" || rolNorm === "admin") ? rolNorm : usuario.rol;
    }

    if (body.password_hash !== undefined) patch.password_hash = body.password_hash;

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