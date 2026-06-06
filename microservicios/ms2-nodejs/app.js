const express = require("express");
const cors = require("cors");

const certAuth = require("./src/middleware/certAuth");
const jwtAuth = require("./src/middleware/jwtAuth");
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const readingProgressRoutes = require("./src/routes/readingProgressRoutes");
const favoriteRoutes = require("./src/routes/favoriteRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(certAuth);

app.get("/health", (req, res) =>
  res.json({ status: "OK", service: "MS2-NodeJS" })
);

// Pública: intercambio de Firebase ID token por JWT propio
app.use("/auth", authRoutes);

// Pública: registro de nuevos usuarios
app.post("/users", require("./src/controllers/userController").create);

// Privadas: requieren JWT válido
app.use(jwtAuth);
app.use("/users", userRoutes);
app.use("/reading-progress", readingProgressRoutes);
app.use("/favorites", favoriteRoutes);

module.exports = app;
