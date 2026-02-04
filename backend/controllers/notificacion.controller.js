const { where } = require("sequelize");
const db = require("../models");
const Notificacion = db.notificacion;
const Op = db.Sequelize.Op;

//Create and Save a new Note
exports.create = (req, res) => {
    //Validate request
    if (!req.body.notificacion ) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    Notificacion.create({
        notificacion: req.body.notificacion,
       
        filename: req.file ? req.file.filename : ""

    })
        .then(data => res.send(data))
        .catch(err => res.status(500).send({ message: err.message }));
};

// Get all Notes
exports.findAll = (req, res) => {
    Notificacion.findAll()
        .then(data => res.send(data))
        .catch(err => res.status(500).send({ message: err.message }));
};

//Get Note by Id

exports.findOne = (req, res) => {
    const id = req.params.id;
    console.log("🟢 Buscando notificacion con id:", id);

    Notificacion.findByPk(id)
        .then(data => {
            if (data) {
                console.log("Notificacion encontrada:", data);
                res.send(data);
            } else {
                console.log("⚠️ No existe notificacion con id:", id);
                res.status(404).send({ message: `No existe notificacion con id=${id}` });
            }
        })
        .catch(err => {
            console.error("❌ Error al buscar notificacion:", err);
            res.status(500).send({
                message: err.message || "Error al obtener notificacion con id=" + id
            });
        });
};

//Update Note
exports.update = (req, res) => {
    const id = req.params.id;
    Notificacion.update(req.body, { where: { id: id } })
        .then(num => {
            if (num == 1) res.send({ message: "Notificacion actualizada" });
            else res.send({ message: `No se puede actualizar notificacion con id=${id}` });

        })
        .catch(err => {
            console.error("❌ Error al buscar notificación:", err);
            res.status(500).send({
                message: err.message || "error al obtener notificación con id=" + id
            });
        });
};

//Delete Note
exports.delete = (req, res) => {
    const id = req.params.id;
    Notificacion.destroy({ where: { id: id } })
        .then(num => {
            if (num == 1) res.send({ message: "Notificación eliminada" });
            else res.send({ message: 'No se pudo eliminar la notificación con id=${id}' });
        })
        .catch(err => res.status(500).send({ message: err.message }));
};