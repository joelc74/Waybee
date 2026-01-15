module.exports = (sequelize, Sequelize) => {
    const Valoracion = sequelize.define("valoracion", {
        id_valoracion: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        id_servicio: {
            type: Sequelize.INTEGER,
            allowNull: false,
            comment: 'ID del servicio (viaje o envío)'
        },
        tipo_servicio: {
            type: Sequelize.ENUM('viaje', 'envio'),
            allowNull: false,
            comment: 'Tipo de servicio valorado'
        },
        id_usuario: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'usuario',
                key: 'id_usuario'
            },
            comment: 'Usuario que realiza la valoración'
        },
        id_conductor: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'conductor',
                key: 'id_conductor'
            },
            comment: 'Conductor valorado'
        },
        puntuacion: {
            type: Sequelize.TINYINT,
            allowNull: false,
            validate: {
                min: 1,
                max: 5
            },
            comment: 'Puntuación de 1 a 5 estrellas'
        },
        comentario: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'Comentario opcional sobre el servicio'
        },
        fecha_valoracion: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
            comment: 'Fecha y hora de la valoración'
        
        }
    }, {
        tableName: "valoracion",
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ['id_servicio', 'tipo_servicio'],
                name: 'uk_servicio_valoracion'
            },
            {
                fields: ['id_usuario'],
                name: 'idx_valoracion_usuario'
            },
            {
                fields: ['id_conductor'],
                name: 'idx_valoracion_conductor'
            },
            {
                fields: ['tipo_servicio'],
                name: 'idx_valoracion_tipo'
            },
            {
                fields: ['puntuacion'],
                name: 'idx_valoracion_puntuacion'
            },
            {
                fields: ['fecha_valoracion'],
                name: 'idx_valoracion_fecha'
            }
        ],
        comment: 'Tabla de valoraciones para viajes y envíos'
    });

    Valoracion.associate = (models) => {
        Valoracion.hasMany(models.usuario, {
            foreignKey: 'id_usuario',
            as: 'usuario',
        });

    };
    Valoracion.associate = (models) => {
        Valoracion.hasMany(models.conductor, {
            foreignKey: 'id_conductor',
            as: 'conductor',
        });
    };
    
    return Valoracion;
};