import * as app from './src/server/app.js';

const port = process.env.PORT || 4000;

// Configuración inicial
app.app.set("port", port);
app.app.listen(app.app.get("port"));
console.log("Escuchando el puerto " + app.app.get("port"));