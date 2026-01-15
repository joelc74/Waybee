const { where } = require("sequelize");
const db = require("../models");
const Servicio_viaje = db.servicio_viaje;
const Op = db.Sequelize.Op;

//Create and Save a new Travel_service
exports.create = (req, res) => {
    //Validate request
    if (!req.body.numero_personas || !req.body.fecha_solicitud || !req.body.fecha_completado || !req.body.origen_direccion || !req.body.destino_direccion || !req.body.estado || !req.body.precio || !req.body.distancia_km || !req.body.duracion_minutos) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    Servicio_viaje.create({
        numero_personas: req.body.numero_personas,
        fecha_solicitud: req.body.fecha_solicitud,
        fecha_completado: req.body.fecha_completado,
        origen_direccion: req.body.origen_direccion,
        destino_direccion: req.body.destino_direccion,
        estado: req.body.estado,
        precio: req.body.precio,
        distancia_km: req.body.distancia_km,
        duracion_minutos: req.body.duracion_minutos,
        filename: req.file ? req.file.filename : ""

    })
        .then(data => res.send(data))
        .catch(err => res.status(500).send({ message: err.message }));
};

// Get all travel_service
exports.findAll = (req, res) => {
    Servicio_viaje.findAll()
        .then(data => res.send(data))
        .catch(err => res.status(500).send({ message: err.message }));
};

//Get travel_service by Id

exports.findOne = (req, res) => {
    const id = req.params.id;
    console.log("🟢 Buscando Servicio_viaje con id:", id);

    Servicio_viaje.findByPk(id)
        .then(data => {
            if (data) {
                console.log("📦 Servicio_viaje encontrado:", data);
                res.send(data);
            } else {
                console.log("⚠️ No existe Servicio_viaje con id:", id);
                res.status(404).send({ message: `No existe Servicio_viaje con id=${id}` });
            }
        })
        .catch(err => {
            console.error("❌ Error al buscar Servicio_viaje:", err);
            res.status(500).send({
                message: err.message || "Error al obtener el Servicio_viaje con id=" + id
            });
        });
};

//Update travel_service
exports.update = (req, res) => {
    const id = req.params.id;
    Servicio_viaje.update(req.body, { where: { id: id } })
        .then(num => {
            if (num == 1) res.send({ message: "Servicio_viaje actualizado" });
            else res.send({ message: `No se puede actualizar Servicio_viaje con id=${id}` });

        })
        .catch(err => {
            console.error("❌ Error al buscar Servicio_viaje:", err);
            res.status(500).send({
                message: err.message || "error al obtener Servicio_viaje con id=" + id
            });
        });
};

//Delete travel_service
exports.delete = (req, res) => {
    const id = req.params.id;
    Servicio_viaje.destroy({ where: { id: id } })
        .then(num => {
            if (num == 1) res.send({ message: "Servicio_viaje eliminado" });
            else res.send({ message: 'No se pudo eliminar el Servicio_viaje con id=${id}' });
        })
        .catch(err => res.status(500).send({ message: err.message }));
};