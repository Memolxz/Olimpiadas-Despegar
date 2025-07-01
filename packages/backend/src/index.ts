import express from "express";
import cors from "cors";
import morgan from "morgan";
import { config } from "dotenv";

// Configurar variables de entorno
config();

const app = express();
const port = process.env.PORT || 3000;

// Middlewares globales
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Rutas base
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Manejador de errores global
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    ok: false,
    error: "Error interno del servidor"
  });
});

// 404 handler
app.use((_req: express.Request, res: express.Response) => {
  res.status(404).json({
    ok: false,
    error: "Ruta no encontrada"
  });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
});