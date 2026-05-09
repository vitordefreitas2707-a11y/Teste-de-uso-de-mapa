import express from "express";
import cors from "cors";
import marcadorRoutes from "./routes/marcadorRoutes.js";
import googleApiRoutes from "./routes/googleApiRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
	res.send("Servidor funcional. Endpoints: /bd/marcadores, /api/google/maps/reverse-geocode, /api/google/maps/autocomplete");
});

// Mount API routes under /api to group them
app.use("/bd", marcadorRoutes);
app.use("/api", googleApiRoutes);

export default app;