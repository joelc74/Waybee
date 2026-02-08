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
      unique: true
    },
    id_usuario: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    id_conductor: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    puntuacion: {
      type: Sequelize.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 }
    },
    comentario: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    fecha_valoracion: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    }
  }, {
    tableName: "valoracion",
    timestamps: false,
    indexes: [
      { unique: true, fields: ["id_servicio"] },
      { fields: ["id_usuario"] },
      { fields: ["id_conductor"] }
    ]
  });

  Valoracion.associate = (db) => {
    Valoracion.belongsTo(db.servicio, { foreignKey: "id_servicio", as: "servicio" });
    Valoracion.belongsTo(db.usuario, { foreignKey: "id_usuario", as: "usuario" });
    Valoracion.belongsTo(db.conductor, { foreignKey: "id_conductor", as: "conductor" });
  };

  return Valoracion;
};
