const { where } = require("sequelize");
const db = require("../models");
const Vehiculo = db.vehiculo;
const Op = db.Sequelize.Op;

//Create and Save a new Car
exports.create = (req, res) => {
    //Validate request
    if (!req.body.matricula || !req.body.modelo || !req.body.plazas || !req.body.color || !req.body.ano) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    Vehiculo.create({
        matricula: req.body.matricula,
        modelo: req.body.modelo,
        plazas: req.body.plazas,
        color: req.body.color,
        ano: req.body.ano,
        filename: req.file ? req.file.filename : ""

    })
        .then(data => res.send(data))
        .catch(err => res.status(500).send({ message: err.message }));
};

// Get all Cars
exports.findAll = (req, res) => {
    Vehiculo.findAll()
        .then(data => res.send(data))
        .catch(err => res.status(500).send({ message: err.message }));
};

//Get Car by Id

exports.findOne = (req, res) => {
    const id = req.params.id;
    console.log("🟢 Buscando vehiculo con id:", id);

    Vehiculo.findByPk(id)
        .then(data => {
            if (data) {
                console.log("Vehiculo encontrado:", data);
                res.send(data);
            } else {
                console.log("⚠️ No existe vehiculo con id:", id);
                res.status(404).send({ message: `No existe vehiculo con id=${id}` });
            }
        })
        .catch(err => {
            console.error("❌ Error al buscar vehiculo:", err);
            res.status(500).send({
                message: err.message || "Error al obtener vehiculo con id=" + id
            });
        });
};

//Update Car
exports.update = (req, res) => {
    const id = req.params.id;
    Vehiculo.update(req.body, { where: { id: id } })
        .then(num => {
            if (num == 1) res.send({ message: "Vehiculo actualizado" });
            else res.send({ message: `No se puede actualizar vehiculo con id=${id}` });

        })
        .catch(err => {
            console.error("❌ Error al buscar vehiculo:", err);
            res.status(500).send({
                message: err.message || "error al obtener vehiculo con id=" + id
            });
        });
};

//Delete Employee
exports.delete = (req, res) => {
    const id = req.params.id;
    Vehiculo.destroy({ where: { id: id } })
        .then(num => {
            if (num == 1) res.send({ message: "Vehiculo eliminado" });
            else res.send({ message: 'No se pudo eliminar al vehiculo con id=${id}' });
        })
        .catch(err => res.status(500).send({ message: err.message }));
};