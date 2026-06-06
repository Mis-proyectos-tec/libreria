const jwt = require("jsonwebtoken");

module.exports = function jwtAuth(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token de autenticación requerido" });
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub, email: payload.email, username: payload.username };
    next();
  } catch {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};
