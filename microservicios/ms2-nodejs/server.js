require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const app = require("./app");
const connectDB = require("./src/config/db");

const PORT = process.env.MS2_PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`MS2 Node.js corriendo en puerto ${PORT}`);
  });
});
