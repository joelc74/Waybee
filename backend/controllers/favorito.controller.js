const db = require("../models");
const favorito = db.favorito;

function getUserId(req) {
  return req.user?.id_usuario ?? null;
}

exports.list = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "No autorizado." });

    const favoritos = await favorito.findAll({
      where: { id_usuario: userId },
      order: [["created_at", "DESC"]],
    });

    return res.json(favoritos);
  } catch (err) {
    console.error("❌ favorito.list:", err);
    return res.status(500).json({ message: "Error al listar favoritos." });
  }
};

exports.create = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "No autorizado." });

    const { ruta } = req.body || {};
    if (!ruta || typeof ruta !== "string") {
      return res.status(400).json({ message: "ruta es obligatoria (string JSON)." });
    }

    const nuevo = await favorito.create({
      id_usuario: userId,
      ruta,
    });

    return res.status(201).json(nuevo);
  } catch (err) {
    console.error("❌ favorito.create:", err);
    return res.status(500).json({ message: "Error al crear favorito." });
  }
};

exports.remove = async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ message: "No autorizado." });

    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: "id inválido." });

    const fav = await favorito.findOne({ where: { id, id_usuario: userId } });
    if (!fav) return res.status(404).json({ message: "Favorito no encontrado." });

    await favorito.destroy({ where: { id, id_usuario: userId } });
    return res.json({ message: "Favorito eliminado." });
  } catch (err) {
    console.error("❌ favorito.remove:", err);
    return res.status(500).json({ message: "Error al eliminar favorito." });
  }
};
