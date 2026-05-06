import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") }); 

const { default: app } = await import("./src/app.js"); 

app.listen(3001, () => {
  console.log("Servidor rodando na porta 3001");
});