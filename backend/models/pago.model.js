module.exports = (sequelize, Sequelize) => {
  const Pago = sequelize.define("pago", {
    id_pago: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    id_servicio: {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: true
    },
    importe: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    },
    metodo_pago: {
      type: Sequelize.STRING(30),
      allowNull: false
    },
    estado_pago: {
      type: Sequelize.ENUM("pendiente", "pagado", "fallido", "reembolsado"),
      allowNull: false,
      defaultValue: "pendiente"
    },
    fecha_pago: {
      type: Sequelize.DATE,
      allowNull: true
    }
  }, {
    tableName: "pago",
    timestamps: false,
    indexes: [
      { unique: true, fields: ["id_servicio"] },
      { fields: ["estado_pago"] }
    ]
  });

  Pago.associate = (db) => {
    Pago.belongsTo(db.servicio, { foreignKey: "id_servicio", as: "servicio" });
  };

  return Pago;
};
