const { where } = require("sequelize");
const db = require("../models");
const Usuario = db.usuario;
const Op = db.Sequelize.Op;

//Create and Save a new User
exports.create = (req, res) => {
    //Validate request
    if (!req.body.nombre || !req.body.email || !req.body.telefono || !req.body.activo || !req.body.password_hash || !req.body.fecha_registro || !req.body.rol) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    Usuario.create({
        nombre: req.body.nombre,
        email: req.body.email,
        telefono: req.body.telefono,
        activo: req.body.activo,
        password_hash: req.body.password_hash,
        fecha_registro: req.body.fecha_registro,
        rol: req.body.rol,
        filename: req.file ? req.file.filename : ""

    })
        .then(data => res.send(data))
        .catch(err => res.status(500).send({ message: err.message }));
};

// Get all User
exports.findAll = (req, res) => {
    Usuario.findAll()
        .then(data => res.send(data))
        .catch(err => res.status(500).send({ message: err.message }));
};

//Get User by Id

exports.findOne = (req, res) => {
    const id = req.params.id;
    console.log("🟢 Buscando Usuario con id:", id);

    Usuario.findByPk(id)
        .then(data => {
            if (data) {
                console.log("Usuario encontrado:", data);
                res.send(data);
            } else {
                console.log("⚠️ No existe usuario con id:", id);
                res.status(404).send({ message: `No existe usuario con id=${id}` });
            }
        })
        .catch(err => {
            console.error("❌ Error al buscar usuario:", err);
            res.status(500).send({
                message: err.message || "Error al obtener usuario con id=" + id
            });
        });
};

//Update User
exports.update = (req, res) => {
    const id = req.params.id;
    Usuario.update(req.body, { where: { id: id } })
        .then(num => {
            if (num == 1) res.send({ message: "Usuario actualizado" });
            else res.send({ message: `No se puede actualizar usuario con id=${id}` });

        })
        .catch(err => {
            console.error("❌ Error al buscar usuario:", err);
            res.status(500).send({
                message: err.message || "error al obtener usuario con id=" + id
            });
        });
};

//Delete User
exports.delete = (req, res) => {
    const id = req.params.id;
    Usuario.destroy({ where: { id: id } })
        .then(num => {
            if (num == 1) res.send({ message: "Usuario eliminado" });
            else res.send({ message: 'No se pudo eliminar al usuario con id=${id}' });
        })
        .catch(err => res.status(500).send({ message: err.message }));
};