const db = require("../models");
const Servicio = db.servicio;

/**
 * Resuelve el id_conductor REAL (tabla conductor) a partir de lo que mande el frontend.
 * - Si manda un id_conductor válido -> lo usamos.
 * - Si manda un id_usuario (rol driver) -> buscamos conductor por id_usuario y devolvemos su id_conductor.
 * Devuelve number o null.
 */
async function resolveConductorId(inputId, transaction) {
  const raw = Number(inputId);
  if (!Number.isFinite(raw) || raw <= 0) return null;

  // 1) Intento: input ya es un id_conductor REAL
  if (db.conductor && typeof db.conductor.findByPk === "function") {
    const byPk = await db.conductor.findByPk(raw, { transaction });
    if (byPk) return byPk.id_conductor;
  }

  // 2) Intento: input es id_usuario -> buscar conductor por id_usuario
  if (db.conductor && typeof db.conductor.findOne === "function") {
    const byUser = await db.conductor.findOne({
      where: { id_usuario: raw },
      transaction,
    });
    if (byUser) return byUser.id_conductor;
  }

  return null;
}

exports.create = async (req, res) => {
  try {
    const body = req.body || {};

    if (!body.tipo_servicio) {
      return res.status(400).json({ message: "tipo_servicio (viaje|envio) es obligatorio." });
    }
    if (!body.id_usuario) {
      return res.status(400).json({ message: "id_usuario es obligatorio." });
    }
    if (!body.origen_direccion || !body.destino_direccion) {
      return res.status(400).json({ message: "origen_direccion y destino_direccion son obligatorios." });
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
      precio: body.precio ?? null,

      peso_paquete: body.tipo_servicio === "envio" ? (body.peso_paquete ?? null) : null,
      dimensiones_paquete: body.tipo_servicio === "envio" ? (body.dimensiones_paquete ?? null) : null,
      fragil: body.tipo_servicio === "envio" ? (body.fragil ?? false) : false,
    });

    return res.status(201).json(servicio);
  } catch (e) {
    console.error("❌ create servicio:", e);
    return res.status(500).json({ message: e.message || "Error creando servicio." });
  }
};

exports.pool = async (req, res) => {
  try {
    const { tipo_servicio } = req.query;
    const where = { estado: "pendiente", id_conductor: null };
    if (tipo_servicio) where.tipo_servicio = tipo_servicio;

    const servicios = await Servicio.findAll({ where, order: [["fecha_creacion", "DESC"]] });
    return res.json(servicios);
  } catch (e) {
    console.error("❌ pool servicio:", e);
    return res.status(500).json({ message: e.message || "Error obteniendo pool." });
  }
};

/**
 * Aceptar servicio
 * POST /api/servicio/:id/accept  body: { id_conductor }
 *
 * IMPORTANTE:
 * - El frontend puede mandar:
 *    a) conductor.id_conductor REAL  (1,2,3...)
 *    b) usuario.id_usuario del driver (7,8,9...)  -> lo resolvemos a conductor.id_conductor
 */
exports.accept = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const id_servicio = req.params.id;
    const { id_conductor } = req.body || {};

    if (!id_conductor) {
      await t.rollback();
      return res.status(400).json({ message: "id_conductor es obligatorio." });
    }

    const realConductorId = await resolveConductorId(id_conductor, t);

    if (!realConductorId) {
      await t.rollback();
      return res.status(400).json({
        message:
          "El conductor no existe en la tabla 'conductor' para ese usuario. Crea primero el conductor (conductor.id_usuario) o envía un id_conductor real.",
      });
    }

    const [updated] = await Servicio.update(
      { estado: "aceptado", id_conductor: realConductorId, fecha_aceptacion: new Date() },
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
    console.error("❌ accept servicio:", e);
    return res.status(500).json({ message: e.message || "Error aceptando servicio." });
  }
};

exports.findOne = async (req, res) => {
  try {
    const servicio = await Servicio.findByPk(req.params.id);
    if (!servicio) return res.status(404).json({ message: "Servicio no encontrado." });
    return res.json(servicio);
  } catch (e) {
    console.error("❌ findOne servicio:", e);
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

    // FIX: si el frontend manda id_usuario (8/9) en id_conductor,
    // lo resolvemos a id_conductor real (1/2) como en accept.
    if (id_conductor) {
      const realConductorId = await resolveConductorId(id_conductor, null);

      // Si no existe conductor asociado, devolvemos vacío (no 500)
      if (!realConductorId) {
        return res.json([]);
      }

      where.id_conductor = realConductorId;
    }

    const servicios = await Servicio.findAll({ where, order: [["fecha_creacion", "DESC"]] });
    return res.json(servicios);
  } catch (e) {
    console.error("❌ findAll servicio:", e);
    return res.status(500).json({ message: e.message || "Error listando servicios." });
  }
};

/*
 * body: { estado, precio_final? }
 */
exports.setEstado = async (req, res) => {
  try {
    const id_servicio = req.params.id;
    const { estado, precio_final, precio } = req.body || {};

    const allowed = ["pendiente", "aceptado", "en_curso", "completado", "cancelado"];
    if (!allowed.includes(estado)) {
      return res.status(400).json({ message: "Estado no válido." });
    }

    const servicio = await Servicio.findByPk(id_servicio);
    if (!servicio) return res.status(404).json({ message: "Servicio no encontrado." });

    const patch = { estado };

    if (estado === "completado") patch.fecha_completado = new Date();

    // Compatibilidad: si frontend manda precio_final, lo guardamos en "precio"
    if (precio_final !== undefined) patch.precio = precio_final;
    if (precio !== undefined) patch.precio = precio;

    await servicio.update(patch);
    return res.json(servicio);
  } catch (e) {
    console.error("❌ setEstado servicio:", e);
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
    console.error("❌ remove servicio:", e);
    return res.status(500).json({ message: e.message || "Error eliminando servicio." });
  }
};