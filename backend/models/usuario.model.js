// backend/models/usuario.model.js

module.exports = (sequelize, Sequelize) => {
  const Usuario = sequelize.define("usuario", {
    id_usuario: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    nombre: {
      type: Sequelize.STRING(100),
      allowNull: false
    },
    email: {
      type: Sequelize.STRING(150),
      allowNull: false,
      unique: true,
      validate: { isEmail: true }
    },
    telefono: {
      type: Sequelize.STRING(20),
      allowNull: true
    },
    activo: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    password_hash: {
      type: Sequelize.STRING(255),
      allowNull: false
    },
    fecha_registro: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    },
    rol: {
      type: Sequelize.ENUM("user", "driver", "admin"),
      allowNull: false,
      defaultValue: "user"
    },

    // ✅ NUEVO
    img_profile: {
      type: Sequelize.STRING(255),
      allowNull: true
    }

  }, {
    tableName: "usuario",
    timestamps: false,
    indexes: [
      { unique: true, fields: ["email"] },
      { fields: ["rol"] }
    ]
  });

  Usuario.associate = (db) => {
    Usuario.hasOne(db.conductor, { foreignKey: "id_usuario", as: "conductor" });
    Usuario.hasMany(db.servicio, { foreignKey: "id_usuario", as: "servicios" });
    Usuario.hasMany(db.valoracion, { foreignKey: "id_usuario", as: "valoraciones_emitidas" });
  };

  return Usuario;
};
