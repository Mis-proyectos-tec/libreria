const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(process.env.COSMOS_CONNECTION_STRING);
    console.log("Conectado a Cosmos DB");
  } catch (error) {
    console.error("Error al conectar a Cosmos DB:", error.message);
    process.exit(1);
  }
}

module.exports = connectDB;
