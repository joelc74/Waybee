module.exports = (sequelize, Sequelize) => {
    const Vehiculo = sequelize.define("vehiculo", {
        id_vehiculo: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        matricula: {
            type: Sequelize.STRING(15),
            unique: true,
            allowNull: false
        },
        modelo: {
            type: Sequelize.STRING(150),
            allowNull: false
        },
        plazas: {
            type: Sequelize.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 10
            }
        },
        color: {
            type: Sequelize.STRING(50),
            allowNull: true
        },
        ano: {
            type: Sequelize.INTEGER,
            allowNull: true
        }
    }, {
        tableName: "vehiculo",
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ['matricula']
            }
        ]
    });
    
    return Vehiculo;
};