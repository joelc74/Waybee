
exports.pool = async (req, res) => {
  return res.status(200).send([]); // placeholder
};

exports.accept = async (req, res) => {
  return res.status(200).send({ ok: true }); // placeholder
};

exports.create = async (req, res) => {
  try {
    const body = req.body || {};

    if (!body.tipo_servicio) {
      return res.status(400).send({ message: "tipo_servicio es obligatorio (viaje|envio)." });
    }
    if (!body.id_usuario) {
      return res.status(400).send({ message: "id_usuario es obligatorio." });
    }
    if (!body.origen_direccion || !body.destino_direccion) {
      return res.status(400).send({ message: "origen_direccion y destino_direccion son obligatorios." });
    }

    // Reglas por tipo
    if (body.tipo_servicio === "viaje") {
      if (!body.numero_personas) {
        return res.status(400).send({ message: "numero_personas es obligatorio para viaje." });
      }
    }

    if (body.tipo_servicio === "envio") {
      if (body.peso_paquete === undefined || body.peso_paquete === null) {
        return res.status(400).send({ message: "peso_paquete es obligatorio para envío." });
      }
    }

    // Si quieres forzar que SIEMPRE vengan calculados, descomenta:
    /*
    if (body.precio_estimado === undefined || body.precio_estimado === null) {
      return res.status(400).send({ message: "precio_estimado es obligatorio (calculado en frontend)." });
    }
    if (body.distancia_km === undefined || body.distancia_km === null) {
      return res.status(400).send({ message: "distancia_km es obligatoria (calculada en frontend)." });
    }
    if (body.duracion_minutos === undefined || body.duracion_minutos === null) {
      return res.status(400).send({ message: "duracion_minutos es obligatoria (calculada en frontend)." });
    }
    */

    const solicitud = await Solicitud.create({
      tipo_servicio: body.tipo_servicio,
      id_usuario: body.id_usuario,
      origen_direccion: body.origen_direccion,
      destino_direccion: body.destino_direccion,

      // Viaje
      numero_personas: body.tipo_servicio === "viaje" ? body.numero_personas : null,

      // Envío
      peso_paquete: body.tipo_servicio === "envio" ? body.peso_paquete : null,
      dimensiones: body.tipo_servicio === "envio" ? (body.dimensiones ?? null) : null,
      fragil: body.tipo_servicio === "envio" ? (body.fragil ?? false) : false,

      // Estimaciones (si las guardas aquí)
      distancia_km: body.distancia_km ?? null,
      precio_estimado: body.precio_estimado ?? null
    });

    return res.status(201).send(solicitud);
  } catch (err) {
    return res.status(500).send({
      message: err.message || "Error creando la solicitud."
    });
  }
};
