module.exports = (sequelize, Sequelize) => {
    const Servicio_viaje = sequelize.define("servicio_viaje", {
        id_viaje: {
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
        id_solicitud: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'solicitud',
                key: 'id_solicitud'
            }
        },
        numero_personas: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 1,
            validate: {
                min: 1,
                max: 10
            }
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
        duracion_minutos: {
            type: Sequelize.INTEGER,
            allowNull: true
        }
    }, {
        tableName: "servicio_viaje",
        timestamps: false,
        indexes: [
            {
                fields: ['id_usuario']
            },
            {
                fields: ['id_conductor']
            },
            {
                fields: ['id_solicitud']
            },
            {
                fields: ['estado']
            },
            {
                fields: ['fecha_solicitud']
            }
        ]
    });
   Servicio_viaje.associate = function(models) {
        Servicio_viaje.belongsTo(models.usuario, {
            foreignKey: 'id_usuario',
            as: 'usuario'
        });
        Servicio_viaje.belongsTo(models.conductor, {
            foreignKey: 'id_conductor',
            as: 'conductor'
        });
        Servicio_viaje.belongsTo(models.solicitud, {
            foreignKey: 'id_solicitud',
            as: 'solicitud'
        });
    };

    return Servicio_viaje;
};