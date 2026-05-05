import express from "express";
import cors from "cors";
import marcadorRoutes from "./routes/marcadorRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
	res.send("Servidor funcional lembre de usar /marcadores");
});

app.use("/", marcadorRoutes);

export default app;