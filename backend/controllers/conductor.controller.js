const { where } = require("sequelize");
const db = require("../models");
const Conductor = db.conductor;
const Op = db.Sequelize.Op;

//Create and Save a new driver
exports.create = (req, res) => {
    //Validate request
    if (!req.body.licencia_conducir || !req.body.disponibilidad || !req.body.estado || !req.body.fecha_registro) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    Conductor.create({
        licencia_conducir: req.body.licencia_conducir,
        disponibilidad: req.body.disponibilidad,
        estado: req.body.estado,
        fecha_registro: req.body.fecha_registro,
        filename: req.file ? req.file.filename : ""

    })
        .then(data => res.send(data))
        .catch(err => res.status(500).send({ message: err.message }));
};

// Get all drivers
exports.findAll = (req, res) => {
    Conductor.findAll()
        .then(data => res.send(data))
        .catch(err => res.status(500).send({ message: err.message }));
};

//Get driver by Id

exports.findOne = (req, res) => {
    const id = req.params.id;
    console.log("🟢 Buscando Conductor con id:", id);

    Conductor.findByPk(id)
        .then(data => {
            if (data) {
                console.log("Conductor encontrado:", data);
                res.send(data);
            } else {
                console.log("⚠️ No existe conductor con id:", id);
                res.status(404).send({ message: `No existe conductor con id=${id}` });
            }
        })
        .catch(err => {
            console.error("❌ Error al buscar conductor:", err);
            res.status(500).send({
                message: err.message || "Error al obtener el conductor con id=" + id
            });
        });
};

//Update Driver
exports.update = (req, res) => {
    const id = req.params.id;
    Conductor.update(req.body, { where: { id: id } })
        .then(num => {
            if (num == 1) res.send({ message: "Conductor actualizado" });
            else res.send({ message: `No se puede actualizar conductor con id=${id}` });

        })
        .catch(err => {
            console.error("❌ Error al buscar conductor:", err);
            res.status(500).send({
                message: err.message || "error al obtener conductor con id=" + id
            });
        });
};

//Delete Driver
exports.delete = (req, res) => {
    const id = req.params.id;
    Conductor.destroy({ where: { id: id } })
        .then(num => {
            if (num == 1) res.send({ message: "Conductor eliminado" });
            else res.send({ message: 'No se pudo eliminar el conductor con id=${id}' });
        })
        .catch(err => res.status(500).send({ message: err.message }));
};