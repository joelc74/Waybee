const db = require("../models");

// en tu models/index.js el modelo es db.favorito (minúsculas)
const favorito = db.favorito;

// tu middleware deja req.user = user (sequelize) y también req.jwt
function getuserid(req) {
  return req.user?.id_usuario ?? req.user?.id ?? req.userId ?? null;
}

exports.list = async (req, res) => {
  try {
    const id_usuario = getuserid(req);
    if (!id_usuario) return res.status(401).json({ message: "no autorizado" });

    const rows = await favorito.findAll({
      where: { id_usuario },
      order: [["created_at", "desc"]],
    });

    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "error al listar favoritos" });
  }
};

exports.create = async (req, res) => {
  try {
    const id_usuario = getuserid(req);
    if (!id_usuario) return res.status(401).json({ message: "no autorizado" });

    const body = req.body || {};

    const titulo = (body.titulo ?? "").toString().trim();
    const origen_direccion = (body.origen_direccion ?? "").toString().trim();
    const destino_direccion = (body.destino_direccion ?? "").toString().trim();

    const origen_lat = body.origen_lat;
    const origen_lng = body.origen_lng;
    const destino_lat = body.destino_lat;
    const destino_lng = body.destino_lng;

    if (!titulo) return res.status(400).json({ message: "titulo es obligatorio" });
    if (!origen_direccion || !destino_direccion) {
      return res.status(400).json({ message: "origen_direccion y destino_direccion son obligatorios" });
    }

    const created = await favorito.create({
      id_usuario,
      titulo,
      origen_direccion,
      origen_lat,
      origen_lng,
      destino_direccion,
      destino_lat,
      destino_lng,
    });

    return res.status(201).json(created);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "error al crear favorito" });
  }
};

exports.remove = async (req, res) => {
  try {
    const id_usuario = getuserid(req);
    if (!id_usuario) return res.status(401).json({ message: "no autorizado" });

    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: "id inválido" });

    const row = await favorito.findOne({ where: { id, id_usuario } });
    if (!row) return res.status(404).json({ message: "favorito no encontrado" });

    await favorito.destroy({ where: { id, id_usuario } });
    return res.json({ message: "favorito eliminado" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "error al eliminar favorito" });
  }
};
