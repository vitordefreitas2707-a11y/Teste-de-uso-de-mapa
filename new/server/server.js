import dotenv from "dotenv";
dotenv.config(); // Removido o path fixo porque agora o .env fica na raiz da pasta server
import app from "./src/app.js"; // Simplificado para import padrão, já que agora usamos type: module

app.listen(3001); // O servidor continua na porta 3001 como o original