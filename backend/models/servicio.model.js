module.exports = (sequelize, Sequelize) => {
  const Servicio = sequelize.define("servicio", {
    id_servicio: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    tipo_servicio: {
      type: Sequelize.ENUM("viaje", "envio"),
      allowNull: false
    },

    estado: {
      type: Sequelize.ENUM("pendiente", "aceptado", "en_curso", "completado", "cancelado"),
      allowNull: false,
      defaultValue: "pendiente"
    },

    id_usuario: {
      type: Sequelize.INTEGER,
      allowNull: false
    },

    id_conductor: {
      type: Sequelize.INTEGER,
      allowNull: true
    },

    fecha_creacion: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW
    },

    fecha_aceptacion: {
      type: Sequelize.DATE,
      allowNull: true
    },

    fecha_completado: {
      type: Sequelize.DATE,
      allowNull: true
    },

    // Direcciones
    origen_direccion: {
      type: Sequelize.STRING(255),
      allowNull: false
    },
    destino_direccion: {
      type: Sequelize.STRING(255),
      allowNull: false
    },

    // Coordenadas
    origen_lat: { type: Sequelize.DECIMAL(10, 7), allowNull: true },
    origen_lng: { type: Sequelize.DECIMAL(10, 7), allowNull: true },
    destino_lat: { type: Sequelize.DECIMAL(10, 7), allowNull: true },
    destino_lng: { type: Sequelize.DECIMAL(10, 7), allowNull: true },

    // Económico / métricas
    distancia_km: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
    precio_estimado: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
    precio_final: { type: Sequelize.DECIMAL(10, 2), allowNull: true },

    // Específicos de viaje
    numero_personas: {
      type: Sequelize.INTEGER,
      allowNull: true
    },

    // Específicos de envío
    peso_paquete: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true
    },
    dimensiones_paquete: {
      type: Sequelize.STRING(80),
      allowNull: true
    },
    fragil: {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false
    }
  }, {
    tableName: "servicio",
    timestamps: false,
    indexes: [
      { fields: ["tipo_servicio"] },
      { fields: ["estado"] },
      { fields: ["id_usuario"] },
      { fields: ["id_conductor"] }
    ]
  });

  Servicio.associate = (db) => {
    Servicio.belongsTo(db.usuario, { foreignKey: "id_usuario", as: "usuario" });
    Servicio.belongsTo(db.conductor, { foreignKey: "id_conductor", as: "conductor" });

    // 1 a 1 (MVP): un pago por servicio y una valoración por servicio
    Servicio.hasOne(db.pago, { foreignKey: "id_servicio", as: "pago" });
    Servicio.hasOne(db.valoracion, { foreignKey: "id_servicio", as: "valoracion" });
  };

  return Servicio;
};
