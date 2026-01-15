const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,

  pool:{
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.usuario = require("./usuario.model.js")(sequelize, Sequelize);
db.vehiculo = require("./vehiculo.model.js")(sequelize, Sequelize);
db.conductor = require("./conductor.model.js")(sequelize, Sequelize);
db.servicio_viaje = require("./servicio_viaje.model.js")(sequelize, Sequelize);
db.servicio_envio = require("./servicio_envio.model.js")(sequelize, Sequelize);
db.pago = require("./pago.model.js")(sequelize, Sequelize);
db.valoracion = require("./valoracion.model.js")(sequelize, Sequelize);
db.user = require ("./user.model.js")(sequelize, Sequelize);

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

module.exports = db;
