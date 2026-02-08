const db = require("../models");
const Conductor = db.conductor;

exports.create = async (req, res) => {
  try {
    const body = req.body || {};
    if (!body.id_usuario) {
      return res.status(400).json({ message: "id_usuario es obligatorio." });
    }

    const conductor = await Conductor.create({
      id_usuario: body.id_usuario,
      disponible: body.disponible ?? false,
      rating_promedio: body.rating_promedio ?? 0.0,
      // fecha_alta default
    });

    return res.status(201).json(conductor);
  } catch (e) {
    return res.status(500).json({ message: e.message || "Error creando conductor." });
  }
};

exports.findAll = async (req, res) => {
  try {
    const { disponible, id_usuario } = req.query;
    const where = {};
    if (disponible !== undefined) where.disponible = String(disponible) === "true";
    if (id_usuario) where.id_usuario = id_usuario;

    const conductores = await Conductor.findAll({ where });
    return res.json(conductores);
  } catch (e) {
    return res.status(500).json({ message: e.message || "Error listando conductores." });
  }
};

exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;
    const conductor = await Conductor.findByPk(id);
    if (!conductor) return res.status(404).json({ message: "Conductor no encontrado." });
    return res.json(conductor);
  } catch (e) {
    return res.status(500).json({ message: e.message || "Error obteniendo conductor." });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body || {};

    const conductor = await Conductor.findByPk(id);
    if (!conductor) return res.status(404).json({ message: "Conductor no encontrado." });

    await conductor.update({
      disponible: body.disponible ?? conductor.disponible,
      rating_promedio: body.rating_promedio ?? conductor.rating_promedio,
    });

    return res.json(conductor);
  } catch (e) {
    return res.status(500).json({ message: e.message || "Error actualizando conductor." });
  }
};

exports.remove = async (req, res) => {
  try {
    const id = req.params.id;
    const conductor = await Conductor.findByPk(id);
    if (!conductor) return res.status(404).json({ message: "Conductor no encontrado." });

    await conductor.destroy();
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Error eliminando conductor." });
  }
};
