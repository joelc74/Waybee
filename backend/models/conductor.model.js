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
      unique: true
    },
    disponible: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    rating_promedio: {
      type: Sequelize.DECIMAL(3, 2), // 0.00 a 5.00
      allowNull: false,
      defaultValue: 0.00
    },
    fecha_alta: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    }
  }, {
    tableName: "conductor",
    timestamps: false,
    indexes: [
      { unique: true, fields: ["id_usuario"] },
      { fields: ["disponible"] }
    ]
  });

  Conductor.associate = (db) => {
    Conductor.belongsTo(db.usuario, { foreignKey: "id_usuario", as: "usuario" });
    Conductor.hasMany(db.vehiculo, { foreignKey: "id_conductor", as: "vehiculos" });
    Conductor.hasMany(db.servicio, { foreignKey: "id_conductor", as: "servicios_asignados" });
    Conductor.hasMany(db.valoracion, { foreignKey: "id_conductor", as: "valoraciones_recibidas" });
  };

  return Conductor;
};
