const db = require("../models");
const User = db.user;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Op = db.Sequelize.Op;

// 🔐 Clave JWT — ¡NO LA DEJES EN DURO EN PRODUCCIÓN!
const JWT_SECRET = process.env.JWT_SECRET || 'dabuten';

application.use(function (req,res,next) {
    //check header or url parameters or post parameters for token
    var token = req.headers['authorization'];
    if(!token) return next(); // if no token, continue

    if(req.headers.authorization.indexOf('Basic') === 0){
        // verify auth basic credentials
        const base64Credentials = req.headers.authorization.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const [email,password] = credentials.split(';');

        req.body.email = email;
        req.body.password = password;

        return next();
    }
});

// =====================================================
// 🧩 REGISTRO DE USUARIO
// =====================================================
exports.register = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email y contraseña son obligatorios." });
    }

    try {
        // Verifica si ya existe un usuario con ese email
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "El email ya está registrado." });
        }

        // Hashea la contraseña antes de guardarla
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            email,
            password: hashedPassword
        });

        res.status(201).json({
            message: "Usuario registrado correctamente.",
            user: { id: user.id, email: user.email }
        });

    } catch (err) {
        console.error("Error en register:", err);
        res.status(500).json({ message: "Error interno al registrar el usuario." });
    }
};

// =====================================================
// 🔑 LOGIN DE USUARIO
// =====================================================
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email y contraseña son obligatorios." });
    }

    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }

        console.log("Stored password hash:", user.password); // Log del hash almacenado
        const isMatch = await bcrypt.compare(password, user.password);
        console.log("Password match result:", isMatch); // Log del resultado de la comparación

        if (!isMatch) {
            return res.status(401).json({ message: "Contraseña incorrecta." });
        }

        // Generar token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({
            message: "Login exitoso.",
            token: `Bearer ${token}`,
            user: {
                id: user.id,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ message: "Error interno al iniciar sesión." });
    }
};

// =====================================================
// 📋 OBTENER TODOS LOS USUARIOS
// =====================================================
exports.findAll = async (req, res) => {
    try {
        const email = req.query.email;
        const condition = email ? { email: { [Op.like]: `%${email}%` } } : null;
        const users = await User.findAll({ where: condition });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: "Error al obtener los usuarios." });
    }
};

// =====================================================
// 🔍 OBTENER UN USUARIO POR ID
// =====================================================
exports.findOne = async (req, res) => {
    const id = req.params.id;

    try {
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: `No se encontró el usuario con id=${id}.` });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: "Error al obtener el usuario." });
    }
};

// =====================================================
// ✏️ ACTUALIZAR USUARIO
// =====================================================
exports.update = async (req, res) => {
    const id = req.params.id;

    try {
        const [updated] = await User.update(req.body, { where: { id } });
        if (updated) {
            res.json({ message: "Usuario actualizado correctamente." });
        } else {
            res.status(404).json({ message: `No se pudo actualizar el usuario con id=${id}.` });
        }
    } catch (err) {
        res.status(500).json({ message: "Error al actualizar el usuario." });
    }
};

// =====================================================
// 🗑️ ELIMINAR UN USUARIO
// =====================================================
exports.delete = async (req, res) => {
    const id = req.params.id;

    try {
        const deleted = await User.destroy({ where: { id } });
        if (deleted) {
            res.json({ message: "Usuario eliminado correctamente." });
        } else {
            res.status(404).json({ message: `No se encontró el usuario con id=${id}.` });
        }
    } catch (err) {
        res.status(500).json({ message: "Error al eliminar el usuario." });
    }
};

// =====================================================
// ⚠️ ELIMINAR TODOS LOS USUARIOS (ADMIN)
// =====================================================
exports.deleteAll = async (req, res) => {
    try {
        const nums = await User.destroy({ where: {}, truncate: false });
        res.json({ message: `${nums} usuarios fueron eliminados correctamente.` });
    } catch (err) {
        res.status(500).json({ message: "Error al eliminar todos los usuarios." });
    }
};
