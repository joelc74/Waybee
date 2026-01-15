const express = require("express");
const cors = require("cors");
var path = require('path');
const db = require("./models");

const app = express();
//public directory
app.use('/images', express.static(path.join(__dirname, 'public/images')));


var corsOptions = {
    origin: "http://localhost:8100"
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

//Sincronizar BD
db.sequelize.sync({ alter: true })  // Usa { force: true } solo en desarrollo para recrear tablas
    .then(() => {
        console.log("✅ Base de datos sincronizada");
    })
    .catch(err => {
        console.error("❌ Error al sincronizar:", err);
    });

//Ruta de raiz
app.get("/", (req, res) => {
    res.json({ message: "Welcome to Waybee App" });
});

//Importar las rutas de Waybee
require("./routes/conductor.routes")(app);
require("./routes/pago.routes")(app);
require("./routes/servicio_envio.routes")(app);
require("./routes/servicio_viaje.routes")(app);
require("./routes/user.routes")(app);
require("./routes/usuario.routes")(app);
require("./routes/valoracion.routes")(app);
require("./routes/vehiculo.routes")(app);

//Servidor 
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});