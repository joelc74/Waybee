module.exports = (sequelize, Sequelize) => {
    const Conductor = sequelize.define("conductor", {
        id_conductor: {
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
        id_vehiculo: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'vehiculo',
                key: 'id_vehiculo'
            }
        },
        licencia_conducir: {
            type: Sequelize.STRING(50),
            allowNull: true
        },
        disponibilidad: {
            type: Sequelize.ENUM('disponible', 'ocupado'),
            defaultValue: 'disponible'
        },
        estado: {
            type: Sequelize.ENUM('activo', 'inactivo', 'cancelado'),
            defaultValue: 'activo'
        },
        fecha_registro: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        }
    }, {
        tableName: "conductor",
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ['id_usuario']  // Un usuario solo puede ser un conductor
            },
            {
                fields: ['estado', 'disponibilidad']
            }
        ]
    });

       Conductor.associate = function(models) {
        Conductor.belongsTo(models.usuario, {
            foreignKey: 'id_usuario',
            as: 'usuario'
        });
        Conductor.belongsTo(models.vehiculo, {
            foreignKey: 'id_vehiculo',
            as: 'vehiculo'
        });
    };
    
    return Conductor;
};