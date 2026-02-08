module.exports = (sequelize, Sequelize) => {
  const Vehiculo = sequelize.define("vehiculo", {
    id_vehiculo: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    id_conductor: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    marca: {
      type: Sequelize.STRING(60),
      allowNull: false
    },
    modelo: {
      type: Sequelize.STRING(60),
      allowNull: false
    },
    matricula: {
      type: Sequelize.STRING(15),
      allowNull: false,
      unique: true
    },
    tipo: {
      type: Sequelize.STRING(30),
      allowNull: true
    },
    activo: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    tableName: "vehiculo",
    timestamps: false,
    indexes: [
      { unique: true, fields: ["matricula"] },
      { fields: ["id_conductor"] }
    ]
  });

  Vehiculo.associate = (db) => {
    Vehiculo.belongsTo(db.conductor, { foreignKey: "id_conductor", as: "conductor" });
  };

  return Vehiculo;
};
