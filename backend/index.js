require("dotenv").config();

console.log("JWT_SECRET:", process.env.JWT_SECRET ? "OK" : "NO CARGADO"); // 👈 **TEMPORAL**, solo es para comprobar el flujo y si realiza la acción de login correctamente. 
                                                                            // El valor real no se muestra por seguridad.


const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./models");

const app = express();

// ✅ Static: servir imágenes subidas
app.use("/images", express.static(path.join(__dirname, "public", "images")));

const corsOptions = {
  origin: "http://localhost:8100"
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ✅ Sync BD (DEV)
db.sequelize.sync({ alter: true })
  .then(() => console.log("✅ Base de datos sincronizada"))
  .catch(err => console.error("❌ Error al sincronizar:", err));

// ✅ Root
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Waybee App" });
});

// ✅ Rutas (arquitectura nueva)
require("./routes/auth.routes")(app);
require("./routes/usuario.routes")(app);
require("./routes/conductor.routes")(app);
require("./routes/vehiculo.routes")(app);
require("./routes/servicio.routes")(app); // 👈 NUEVA (pool + accept + estados)
require("./routes/pago.routes")(app);
require("./routes/valoracion.routes")(app);
app.use('/favoritos', require('./routes/favorito.routes'));


// ✅ Manejador de errores (incluye Multer)
app.use((err, req, res, next) => {
  if (err && err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "El archivo supera el límite de 5MB." });
    }
    return res.status(400).json({ message: err.message });
  }

  if (err) {
    return res.status(400).json({ message: err.message || "Error en la solicitud." });
  }

  next();
});

// ✅ Server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
