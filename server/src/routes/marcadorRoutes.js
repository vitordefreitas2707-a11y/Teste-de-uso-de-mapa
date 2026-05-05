import express from "express";
import { listarMarcadores, criarMarcador, deletarMarcador, } from "../controllers/marcadorController.js";

const router = express.Router();

router.get("/marcadores", listarMarcadores);
router.post("/marcadores", criarMarcador);
router.delete("/marcadores/:id", deletarMarcador);

export default router;