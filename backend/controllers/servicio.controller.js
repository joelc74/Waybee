const db = require("../models");
const Servicio = db.servicio;

exports.create = async (req, res) => {
  try {
    const body = req.body || {};

    if (!body.tipo_servicio) return res.status(400).json({ message: "tipo_servicio (viaje|envio) es obligatorio." });
    if (!body.id_usuario) return res.status(400).json({ message: "id_usuario es obligatorio." });
    if (!body.origen_direccion || !body.destino_direccion) {
      return res.status(400).json({ message: "origen_direccion y destino_direccion son obligatorios." });
    }

    // reglas por tipo
    if (body.tipo_servicio === "viaje" && !body.numero_personas) {
      return res.status(400).json({ message: "numero_personas es obligatorio para viaje." });
    }
    if (body.tipo_servicio === "envio" && (body.peso_paquete === undefined || body.peso_paquete === null)) {
      return res.status(400).json({ message: "peso_paquete es obligatorio para envio." });
    }

    const servicio = await Servicio.create({
      tipo_servicio: body.tipo_servicio,
      estado: "pendiente",
      id_usuario: body.id_usuario,
      id_conductor: null,

      origen_direccion: body.origen_direccion,
      destino_direccion: body.destino_direccion,

      origen_lat: body.origen_lat ?? null,
      origen_lng: body.origen_lng ?? null,
      destino_lat: body.destino_lat ?? null,
      destino_lng: body.destino_lng ?? null,

      distancia_km: body.distancia_km ?? null,
      precio_estimado: body.precio_estimado ?? null,
      precio_final: null,

      numero_personas: body.tipo_servicio === "viaje" ? body.numero_personas : null,
      peso_paquete: body.tipo_servicio === "envio" ? body.peso_paquete : null,
      dimensiones_paquete: body.tipo_servicio === "envio" ? (body.dimensiones_paquete ?? null) : null,
      fragil: body.tipo_servicio === "envio" ? (body.fragil ?? false) : false,
    });

    return res.status(201).json(servicio);
  } catch (e) {
    return res.status(500).json({ message: e.message || "Error creando servicio." });
  }
};

// Pool: solo pendientes y sin conductor
exports.pool = async (req, res) => {
  try {
    const { tipo_servicio } = req.query;
    const where = { estado: "pendiente", id_conductor: null };
    if (tipo_servicio) where.tipo_servicio = tipo_servicio;

    const servicios = await Servicio.findAll({ where, order: [["fecha_creacion", "DESC"]] });
    return res.json(servicios);
  } catch (e) {
    return res.status(500).json({ message: e.message || "Error obteniendo pool." });
  }
};

// Aceptar: atómico (evita doble aceptación)
exports.accept = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const id_servicio = req.params.id;
    const { id_conductor } = req.body || {};

    if (!id_conductor) {
      await t.rollback();
      return res.status(400).json({ message: "id_conductor es obligatorio." });
    }

    const [updated] = await Servicio.update(
      { estado: "aceptado", id_conductor, fecha_aceptacion: new Date() },
      { where: { id_servicio, estado: "pendiente", id_conductor: null }, transaction: t }
    );

    if (updated === 0) {
      await t.rollback();
      return res.status(409).json({ message: "Servicio no disponible (ya fue aceptado o no está pendiente)." });
    }

    const servicio = await Servicio.findByPk(id_servicio, { transaction: t });
    await t.commit();
    return res.json(servicio);
  } catch (e) {
    await t.rollback();
    return res.status(500).json({ message: e.message || "Error aceptando servicio." });
  }
};

exports.findOne = async (req, res) => {
  try {
    const servicio = await Servicio.findByPk(req.params.id);
    if (!servicio) return res.status(404).json({ message: "Servicio no encontrado." });
    return res.json(servicio);
  } catch (e) {
    return res.status(500).json({ message: e.message || "Error obteniendo servicio." });
  }
};

exports.findAll = async (req, res) => {
  try {
    const { estado, tipo_servicio, id_usuario, id_conductor } = req.query;
    const where = {};
    if (estado) where.estado = estado;
    if (tipo_servicio) where.tipo_servicio = tipo_servicio;
    if (id_usuario) where.id_usuario = id_usuario;
    if (id_conductor) where.id_conductor = id_conductor;

    const servicios = await Servicio.findAll({ where, order: [["fecha_creacion", "DESC"]] });
    return res.json(servicios);
  } catch (e) {
    return res.status(500).json({ message: e.message || "Error listando servicios." });
  }
};

exports.setEstado = async (req, res) => {
  try {
    const id_servicio = req.params.id;
    const { estado, precio_final } = req.body || {};

    const allowed = ["pendiente", "aceptado", "en_curso", "completado", "cancelado"];
    if (!allowed.includes(estado)) {
      return res.status(400).json({ message: "Estado no válido." });
    }

    const servicio = await Servicio.findByPk(id_servicio);
    if (!servicio) return res.status(404).json({ message: "Servicio no encontrado." });

    const patch = { estado };
    if (estado === "completado") patch.fecha_completado = new Date();
    if (precio_final !== undefined) patch.precio_final = precio_final;

    await servicio.update(patch);
    return res.json(servicio);
  } catch (e) {
    return res.status(500).json({ message: e.message || "Error actualizando estado." });
  }
};

exports.remove = async (req, res) => {
  try {
    const id = req.params.id;
    const servicio = await Servicio.findByPk(id);
    if (!servicio) return res.status(404).json({ message: "Servicio no encontrado." });

    await servicio.destroy();
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ message: e.message || "Error eliminando servicio." });
  }
};
