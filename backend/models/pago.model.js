module.exports = (sequelize, Sequelize) => {
    const Pago = sequelize.define("pago", {
        id_pago: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        id_servicio: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        tipo_servicio: {
            type: Sequelize.ENUM('viaje', 'envio'),
            allowNull: false
        },
        metodo: {
            type: Sequelize.ENUM('tarjeta', 'efectivo', 'bizum', 'paypal'),
            allowNull: false
        },
        estado: {
            type: Sequelize.ENUM('pendiente', 'completado', 'fallido', 'reembolsado'),
            defaultValue: 'pendiente'
        },
        monto: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false
        },
        fecha_pago: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        },
        transaccion_id: {
            type: Sequelize.STRING(100),
            allowNull: true
        }
    }, {
        tableName: "pago",
        timestamps: false,
        indexes: [
            {
                fields: ['id_servicio', 'tipo_servicio']
            },
            {
                fields: ['estado']
            },
            {
                fields: ['fecha_pago']
            }
        ]
    });
    
    return Pago;
};