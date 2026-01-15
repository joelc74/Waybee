const { where } = require("sequelize");
const db = require("../models");
const Valoracion = db.valoracion;
const Op = db.Sequelize.Op;

//Create and Save a new Feedback
exports.create = (req, res) => {
    //Validate request
    if (!req.body.tipo_servicio || !req.body.puntuacion || !req.body.comentario || !req.body.fecha_valoracion) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    Valoracion.create({
        tipo_servicio: req.body.tipo_servicio,
        puntuacion: req.body.puntuacion,
        comentario: req.body.tipo_empleado,
        fecha_valoracion: req.body.fecha_valoracion,

        filename: req.file ? req.file.filename : ""

    })
        .then(data => res.send(data))
        .catch(err => res.status(500).send({ message: err.message }));
};

// Get all Feedback
exports.findAll = (req, res) => {
    Valoracion.findAll()
        .then(data => res.send(data))
        .catch(err => res.status(500).send({ message: err.message }));
};

//Get Feedback by Id

exports.findOne = (req, res) => {
    const id = req.params.id;
    console.log("🟢 Buscando Valoracion con id:", id);

    Valoracion.findByPk(id)
        .then(data => {
            if (data) {
                console.log("Valoracion encontrada:", data);
                res.send(data);
            } else {
                console.log("⚠️ No existe Valoracion con id:", id);
                res.status(404).send({ message: `No existe Valoracion con id=${id}` });
            }
        })
        .catch(err => {
            console.error("❌ Error al buscar Valoracion:", err);
            res.status(500).send({
                message: err.message || "Error al obtener Valoracion con id=" + id
            });
        });
};

//Update Feedback
exports.update = (req, res) => {
    const id = req.params.id;
    Valoracion.update(req.body, { where: { id: id } })
        .then(num => {
            if (num == 1) res.send({ message: "Valoracion actualizada" });
            else res.send({ message: `No se puede actualizar Valoracion con id=${id}` });

        })
        .catch(err => {
            console.error("❌ Error al buscar Valoracion:", err);
            res.status(500).send({
                message: err.message || "error al obtener Valoracion con id=" + id
            });
        });
};

//Delete Feedback
exports.delete = (req, res) => {
    const id = req.params.id;
    Valoracion.destroy({ where: { id: id } })
        .then(num => {
            if (num == 1) res.send({ message: "Valoracion eliminada" });
            else res.send({ message: 'No se pudo eliminar la Valoracion con id=${id}' });
        })
        .catch(err => res.status(500).send({ message: err.message }));
};