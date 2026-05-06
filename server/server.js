import dotenv from "dotenv";
dotenv.config({ path: "./server/.env" }); //confirmando que o path do env ta corrento porque ele so nao carregava antes
const { default: app } = await import("./src/app.js"); //precissei por esse await porque ele so carregava as coisas fora de ordem entao o banco de dados simplesmente nao funcionava

app.listen(3001);