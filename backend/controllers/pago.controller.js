const { where } = require("sequelize");
const db = require("../models");
const Pago = db.pago;
const Op = db.Sequelize.Op;

//Create and Save a new Pay
exports.create = (req, res) => {
    //Validate request
    if (!req.body.tipo_servicio || !req.body.metodo || !req.body.estado || !req.body.monto || !req.body.fecha_pago || !req.body.transaccion_id) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    Pago.create({
        tipo_servicio: req.body.tipo_servicio,
        metodo: req.body.metodo,
        estado: req.body.estado,
        monto: req.body.monto,
        fecha_pago: req.body.fecha_pago,
        transaccion_id: req.body.transaccion_id,
        filename: req.file ? req.file.filename : ""

    })
        .then(data => res.send(data))
        .catch(err => res.status(500).send({ message: err.message }));
};

// Get all Pay
exports.findAll = (req, res) => {
    Pago.findAll()
        .then(data => res.send(data))
        .catch(err => res.status(500).send({ message: err.message }));
};

//Get Pay by Id

exports.findOne = (req, res) => {
    const id = req.params.id;
    console.log("🟢 Buscando Pago con id:", id);

    Pago.findByPk(id)
        .then(data => {
            if (data) {
                console.log("📦 Pago encontrado:", data);
                res.send(data);
            } else {
                console.log("⚠️ No existe Pago con id:", id);
                res.status(404).send({ message: `No existe Pago con id=${id}` });
            }
        })
        .catch(err => {
            console.error("❌ Error al buscar Pago:", err);
            res.status(500).send({
                message: err.message || "Error al obtener el Pago con id=" + id
            });
        });
};

//Update Pay
exports.update = (req, res) => {
    const id = req.params.id;
    Pago.update(req.body, { where: { id: id } })
        .then(num => {
            if (num == 1) res.send({ message: "Pago actualizado" });
            else res.send({ message: `No se puede actualizar el pago con id=${id}` });

        })
        .catch(err => {
            console.error("❌ Error al buscar pago:", err);
            res.status(500).send({
                message: err.message || "error al obtener pago con id=" + id
            });
        });
};

//Delete Pay
exports.delete = (req, res) => {
    const id = req.params.id;
    Pago.destroy({ where: { id: id } })
        .then(num => {
            if (num == 1) res.send({ message: "Pago eliminado" });
            else res.send({ message: 'No se pudo eliminar el pago con id=${id}' });
        })
        .catch(err => res.status(500).send({ message: err.message }));
};
