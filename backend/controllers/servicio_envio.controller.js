const { where } = require("sequelize");
const db = require("../models");
const Servicio_envio = db.servicio_envio;
const Op = db.Sequelize.Op;

//Create and Save a new Shipping_service
exports.create = (req, res) => {
    //Validate request
    if (!req.body.descripcion_paquete || !req.body.peso_paquete || !req.body.dimensiones || !req.body.fecha_solicitud || !req.body.fecha_completado || !req.body.origen_direccion || !req.body.destino_direccion || !req.body.estado || !req.body.precio || !req.body.distancia_km || !req.body.fragil) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    Servicio_envio.create({
        descripcion_paquete: req.body.descripcion_paquete,
        peso_paquete: req.body.peso_paquete,
        dimensiones: req.body.dimensiones,
        fecha_solicitud: req.body.fecha_solicitud,
        fecha_completado: req.body.fecha_completado,
        origen_direccion: req.body.origen_direccion,
        destino_direccion: req.body.destino_direccion,
        estado: req.body.estado,
        precio: req.body.precio,
        distancia_km: req.body.distancia_km,
        fragil: req.body.fragil,
        filename: req.file ? req.file.filename : ""

    })
        .then(data => res.send(data))
        .catch(err => res.status(500).send({ message: err.message }));
};

// Get all Shipping_service
exports.findAll = (req, res) => {
    Servicio_envio.findAll()
        .then(data => res.send(data))
        .catch(err => res.status(500).send({ message: err.message }));
};

//Get Shipping_service by Id

exports.findOne = (req, res) => {
    const id = req.params.id;
    console.log("🟢 Buscando Servicio_envio con id:", id);

    Servicio_envio.findByPk(id)
        .then(data => {
            if (data) {
                console.log("📦 Servicio_envio encontrado:", data);
                res.send(data);
            } else {
                console.log("⚠️ No existe Servicio_envio con id:", id);
                res.status(404).send({ message: `No existe Servicio_envio con id=${id}` });
            }
        })
        .catch(err => {
            console.error("❌ Error al buscar Servicio_envio:", err);
            res.status(500).send({
                message: err.message || "Error al obtener el Servicio_envio con id=" + id
            });
        });
};

//Update Shipping_service
exports.update = (req, res) => {
    const id = req.params.id;
    Servicio_envio.update(req.body, { where: { id: id } })
        .then(num => {
            if (num == 1) res.send({ message: "Servicio_envio actualizado" });
            else res.send({ message: `No se puede actualizar Servicio_envio con id=${id}` });

        })
        .catch(err => {
            console.error("❌ Error al buscar Servicio_envio:", err);
            res.status(500).send({
                message: err.message || "error al obtener Servicio_envio con id=" + id
            });
        });
};

//Delete Shipping_service
exports.delete = (req, res) => {
    const id = req.params.id;
    Servicio_envio.destroy({ where: { id: id } })
        .then(num => {
            if (num == 1) res.send({ message: "Servicio_envio eliminado" });
            else res.send({ message: 'No se pudo eliminar el Servicio_envio con id=${id}' });
        })
        .catch(err => res.status(500).send({ message: err.message }));
};