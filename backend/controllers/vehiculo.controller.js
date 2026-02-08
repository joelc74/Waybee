const db = require("../models");
const Vehiculo = db.vehiculo;

exports.create = async (req, res) => {
  try {
    const body = req.body || {};

    if (!body.id_conductor || !body.marca || !body.modelo || !body.matricula) {
      return res.status(400).json({ message: "id_conductor, marca, modelo y matricula son obligatorios." });
    }

    const vehiculo = await Vehiculo.create({
      id_conductor: body.id_conductor,
      marca: body.marca,
      modelo: body.modelo,
      matricula: body.matricula,
      tipo: body.tipo || null,
      activo: body.activo ?? true
    });

    return res.status(201).json(vehiculo);
  } catch (e) {
    return res.status(500).json({ message: e.message || "Error creando vehículo." });
  }
};

exports.findAll = async (req, res) => {
  try {
    const { id_conductor, matricula, activo } = req.query;
    const where = {};
    if (id_conductor) where.id_conductor = id_conductor;
    if (matricula) where.matricula = matricula;
    if (activo !== undefined) where.activo = String(activo) === "true";

    const vehiculos = await Vehiculo.findAll({ where });
    return res.json(vehiculos);
  } catch (e) {
    return res.status(500).json({ message: e.message || "Error listando vehículos." });
  }
};

exports.findOne = async (req, res) => {
  try {
    const id = req.params.id;
    const vehiculo = await Vehiculo.findByPk(id);
    if (!vehiculo) return res.status(404).json({ message: "Vehículo no encontrado." });
    return res.json(vehiculo);
  } catch (e) {
    return res.status(500).json({ message: e.message || "Error obteniendo vehículo." });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body || {};

    const vehiculo = await Vehiculo.findByPk(id);
    if (!vehiculo) return res.status(404).json({ message: "Vehículo no encontrado." });

    await vehiculo.update({
      marca: body.marca ?? vehiculo.marca,
      modelo: body.modelo ?? vehiculo.modelo,
      matricula: body.matricula ?? vehiculo.matricula,
      tipo: body.tipo ?? vehiculo.tipo,
      activo: body.activo ?? vehiculo.activo,
    });

    return res.json(vehiculo);
  } catch (e) {
    return res.status(500).json({ message: e.message || "Error actualizando vehículo." });
  }
};

exports.remove = async (req, res) => {
  try {
    const id = req.params.id;
    const vehiculo = await Vehiculo.findByPk(id);
    if (!vehiculo) return res.status(404).json({ message: "Vehículo no encontrado." });

    await vehiculo.destroy();
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Error eliminando vehículo." });
  }
};
