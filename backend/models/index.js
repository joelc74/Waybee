const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// MODELOS 
db.usuario = require("./usuario.model.js")(sequelize, Sequelize);
db.conductor = require("./conductor.model.js")(sequelize, Sequelize);
db.vehiculo = require("./vehiculo.model.js")(sequelize, Sequelize);
db.servicio = require("./servicio.model.js")(sequelize, Sequelize);
db.pago = require("./pago.model.js")(sequelize, Sequelize);
db.valoracion = require("./valoracion.model.js")(sequelize, Sequelize);
db.favorito = require("./favorito.model.js")(sequelize, Sequelize);

// Asociaciones
Object.keys(db).forEach((modelName) => {
  if (db[modelName] && db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
