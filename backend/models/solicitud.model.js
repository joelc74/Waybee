module.exports = (sequelize, Sequelize) => {
  const Solicitud = sequelize.define("solicitud", {
    id_solicitud: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    // Pool para conductores: viaje o envío
    tipo_servicio: {
      type: Sequelize.ENUM("viaje", "envio"),
      allowNull: false
    },

    // Usuario que solicita
    id_usuario: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "usuario",
        key: "id_usuario"
      }
    },

    fecha_solicitud: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },

    origen_direccion: {
      type: Sequelize.TEXT,
      allowNull: false
    },

    destino_direccion: {
      type: Sequelize.TEXT,
      allowNull: false
    },

    // VIAJE (puede ser null si es envío)
    numero_personas: {
      type: Sequelize.INTEGER,
      allowNull: true,
      validate: { min: 1, max: 10 }
    },

    // ENVÍO (puede ser null si es viaje)
    peso_paquete: {
      type: Sequelize.DECIMAL(6, 2),
      allowNull: true
    },

    dimensiones: {
      type: Sequelize.STRING(50),
      allowNull: true
    },

    fragil: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },

    // Estimaciones calculadas por frontend
    distancia_km: {
      type: Sequelize.DECIMAL(6, 2),
      allowNull: true
    },


    precio_estimado: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true
    }

  }, {
    tableName: "solicitud",
    timestamps: false,
    indexes: [
      { fields: ["tipo_servicio"] },
      { fields: ["fecha_solicitud"] },
      { fields: ["id_usuario"] }
    ]
  });

  Solicitud.associate = function(models) {
    Solicitud.belongsTo(models.usuario, {
      foreignKey: "id_usuario",
      as: "usuario"
    });
  };

  return Solicitud;
};
