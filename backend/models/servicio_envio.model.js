module.exports = (sequelize, Sequelize) => {
    const Servicio_envio = sequelize.define("servicio_envio", {
        id_envio: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        id_usuario: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'usuario',
                key: 'id_usuario'
            }
        },
        id_conductor: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'conductor',
                key: 'id_conductor'
            }
        },
        descripcion_paquete: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        peso_paquete: {
            type: Sequelize.DECIMAL(6, 2),
            allowNull: false,
            comment: 'Peso en kilogramos'
        },
        dimensiones: {
            type: Sequelize.STRING(50),
            allowNull: true,
            comment: 'Formato: largo x ancho x alto (cm)'
        },
        fecha_solicitud: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        },
        fecha_completado: {
            type: Sequelize.DATE,
            allowNull: true
        },
        origen_direccion: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        destino_direccion: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        estado: {
            type: Sequelize.ENUM('solicitado', 'asignado', 'en_camino', 'recogido', 'completado', 'cancelado'),
            defaultValue: 'solicitado'
        },
        precio: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false
        },
        distancia_km: {
            type: Sequelize.DECIMAL(6, 2),
            allowNull: true
        },
        fragil: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        }
    }, {
        tableName: "servicio_envio",
        timestamps: false,
        indexes: [
            {
                fields: ['id_usuario']
            },
            {
                fields: ['id_conductor']
            },
            {
                fields: ['estado']
            }
        ]
    });

    Servicio_envio.associate = function(models) {
        Servicio_envio.belongsTo(models.usuario, {
            foreignKey: 'id_usuario',
            as: 'usuario'
        });
        Servicio_envio.belongsTo(models.conductor, {
            foreignKey: 'id_conductor',
            as: 'conductor'
        });
    };

    return Servicio_envio;
};