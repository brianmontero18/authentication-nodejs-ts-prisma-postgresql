import express from "express";
import dotenv from "dotenv";
import path from "path";

const app = express();

// Middlewares
// Configuración de variables de entorno
dotenv.config({ path: path.resolve(__dirname, "..", `.env.${process.env.NODE_ENV}`) });

export default app;
