const jwt = require("jsonwebtoken");
const https = require("https");
const User = require("../models/User");

function verifyFirebaseToken(idToken) {
  return new Promise((resolve, reject) => {
    const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`;
    https.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error_description || !parsed.sub) {
            reject(new Error(parsed.error_description || "Token inválido"));
          } else {
            resolve(parsed);
          }
        } catch {
          reject(new Error("Respuesta inválida de Google"));
        }
      });
    }).on("error", reject);
  });
}

async function login(req, res) {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ message: "idToken requerido" });
  }

  try {
    const googlePayload = await verifyFirebaseToken(idToken);
    const firebaseUid = googlePayload.sub;

    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const token = jwt.sign(
      { sub: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        initials: user.initials,
      },
    });
  } catch (error) {
    res.status(401).json({ message: "Autenticación fallida: " + error.message });
  }
}

module.exports = { login };
