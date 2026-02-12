module.exports = (sequelize, Sequelize) => {
  const favorito = sequelize.define("favorito", {
    id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

    id_usuario: { type: Sequelize.INTEGER, allowNull: false },

    titulo: { type: Sequelize.STRING(60), allowNull: true },

    origen_direccion: { type: Sequelize.STRING(255), allowNull: false },
    origen_lat: { type: Sequelize.DECIMAL(10, 7), allowNull: true },
    origen_lng: { type: Sequelize.DECIMAL(10, 7), allowNull: true },

    destino_direccion: { type: Sequelize.STRING(255), allowNull: false },
    destino_lat: { type: Sequelize.DECIMAL(10, 7), allowNull: true },
    destino_lng: { type: Sequelize.DECIMAL(10, 7), allowNull: true },

  }, {
    tableName: "favoritos",
    timestamps: true,
    underscored: true,
  });

  favorito.associate = (db) => {
    favorito.belongsTo(db.usuario, { foreignKey: "id_usuario", as: "usuario" });
  };

  return favorito;
};
