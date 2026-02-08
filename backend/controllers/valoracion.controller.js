const db = require("../models");
const Valoracion = db.valoracion;

exports.create = async (req, res) => {
  try {
    const body = req.body || {};
    if (!body.id_servicio || !body.id_usuario || !body.id_conductor || !body.puntuacion) {
      return res.status(400).json({ message: "id_servicio, id_usuario, id_conductor y puntuacion son obligatorios." });
    }

    const valoracion = await Valoracion.create({
      id_servicio: body.id_servicio,
      id_usuario: body.id_usuario,
      id_conductor: body.id_conductor,
      puntuacion: body.puntuacion,
      comentario: body.comentario || null,
      // fecha_valoracion default
    });

    return res.status(201).json(valoracion);
  } catch (e) {
    return res.status(500).json({ message: e.message || "Error creando valoración." });
  }
};

exports.findAll = async (req, res) => {
  try {
    const { id_servicio, id_conductor, id_usuario } = req.query;
    const where = {};
    if (id_servicio) where.id_servicio = id_servicio;
    if (id_conductor) where.id_conductor = id_conductor;
    if (id_usuario) where.id_usuario = id_usuario;

    const valoraciones = await Valoracion.findAll({ where, order: [["fecha_valoracion", "DESC"]] });
    return res.json(valoraciones);
  } catch (e) {
    return res.status(500).json({ message: e.message || "Error listando valoraciones." });
  }
};

exports.findOne = async (req, res) => {
  try {
    const v = await Valoracion.findByPk(req.params.id);
    if (!v) return res.status(404).json({ message: "Valoración no encontrada." });
    return res.json(v);
  } catch (e) {
    return res.status(500).json({ message: e.message || "Error obteniendo valoración." });
  }
};

exports.update = async (req, res) => {
  try {
    const v = await Valoracion.findByPk(req.params.id);
    if (!v) return res.status(404).json({ message: "Valoración no encontrada." });

    const body = req.body || {};
    await v.update({
      puntuacion: body.puntuacion ?? v.puntuacion,
      comentario: body.comentario ?? v.comentario,
    });

    return res.json(v);
  } catch (e) {
    return res.status(500).json({ message: e.message || "Error actualizando valoración." });
  }
};

exports.remove = async (req, res) => {
  try {
    const v = await Valoracion.findByPk(req.params.id);
    if (!v) return res.status(404).json({ message: "Valoración no encontrada." });

    await v.destroy();
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Error eliminando valoración." });
  }
};
