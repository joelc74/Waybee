const db = require("../models");
const Pago = db.pago;

exports.create = async (req, res) => {
  try {
    const body = req.body || {};
    if (!body.id_servicio || body.importe === undefined || !body.metodo_pago) {
      return res.status(400).json({ message: "id_servicio, importe y metodo_pago son obligatorios." });
    }

    const pago = await Pago.create({
      id_servicio: body.id_servicio,
      importe: body.importe,
      metodo_pago: body.metodo_pago,
      estado_pago: body.estado_pago || "pendiente",
      fecha_pago: body.fecha_pago || null,
    });

    return res.status(201).json(pago);
  } catch (e) {
    return res.status(500).json({ message: e.message || "Error creando pago." });
  }
};

exports.findAll = async (req, res) => {
  try {
    const { id_servicio, estado_pago } = req.query;
    const where = {};
    if (id_servicio) where.id_servicio = id_servicio;
    if (estado_pago) where.estado_pago = estado_pago;

    const pagos = await Pago.findAll({ where });
    return res.json(pagos);
  } catch (e) {
    return res.status(500).json({ message: e.message || "Error listando pagos." });
  }
};

exports.findOne = async (req, res) => {
  try {
    const pago = await Pago.findByPk(req.params.id);
    if (!pago) return res.status(404).json({ message: "Pago no encontrado." });
    return res.json(pago);
  } catch (e) {
    return res.status(500).json({ message: e.message || "Error obteniendo pago." });
  }
};

exports.update = async (req, res) => {
  try {
    const pago = await Pago.findByPk(req.params.id);
    if (!pago) return res.status(404).json({ message: "Pago no encontrado." });

    const body = req.body || {};
    await pago.update({
      importe: body.importe ?? pago.importe,
      metodo_pago: body.metodo_pago ?? pago.metodo_pago,
      estado_pago: body.estado_pago ?? pago.estado_pago,
      fecha_pago: body.fecha_pago ?? pago.fecha_pago,
    });

    return res.json(pago);
  } catch (e) {
    return res.status(500).json({ message: e.message || "Error actualizando pago." });
  }
};

exports.remove = async (req, res) => {
  try {
    const pago = await Pago.findByPk(req.params.id);
    if (!pago) return res.status(404).json({ message: "Pago no encontrado." });

    await pago.destroy();
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Error eliminando pago." });
  }
};
