
module.exports = (sequelize, Sequelize) => {
    const Usuario = sequelize.define("usuario", {
        id_usuario: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        nombre: {
            type: Sequelize.STRING(100),
            allowNull: false
        },
        email: {
            type: Sequelize.STRING(150),
            unique: true,
            allowNull: false,
            validate: {
                isEmail: true
            }
        },
        telefono: {
            type: Sequelize.STRING(20),
            allowNull: true
        },
        activo: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        },
        password_hash: {
            type: Sequelize.STRING(255),
            allowNull: true
        },
        fecha_registro: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        },
        rol: {
            type: Sequelize.STRING(100),
            allowNull: false,
            defaultValue: 'cliente'  // 'cliente', 'conductor', 'admin'
        }
    }, {
        tableName: "usuario",
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ['email']
            },
            {
                fields: ['rol']
            }
        ]
    });



    return Usuario;
};