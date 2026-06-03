import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext.jsx";

export default function RegistroPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({ name: "", username: "", email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      await register(formData.name, formData.username, formData.email, formData.password);
      navigate("/home");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setErrorMessage("Este correo ya está registrado.");
      } else if (error.code === "auth/weak-password") {
        setErrorMessage("La contraseña debe tener al menos 6 caracteres.");
      } else if (error.code === "auth/invalid-email") {
        setErrorMessage("El correo no es válido.");
      } else {
        setErrorMessage("No se pudo crear la cuenta. Intente de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="authLayout">

      <div className="authDecorPanel">
        <h1 className="authDecorTitle">Biblio-TEC</h1>
        <div className="authDecorDivider" />
        <p className="authDecorQuote">
          "El que lee mucho y anda mucho, ve mucho y sabe mucho."
        </p>
        <span className="authDecorSub">Biblioteca Digital TEC</span>
      </div>

      <div className="authPanel">
        <div className="authCard">
          <h2>Crear cuenta</h2>
          <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginTop: "-12px", marginBottom: "20px" }}>
            Regístrate para guardar y leer tus libros.
          </p>

          <form className="authForm" onSubmit={handleSubmit}>
            <div className="formGroup">
              <label htmlFor="name">Nombre completo</label>
              <input
                id="name" name="name" type="text"
                placeholder="Tu nombre completo"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="formGroup">
              <label htmlFor="username">Nombre de usuario</label>
              <input
                id="username" name="username" type="text"
                placeholder="Ej: juanperez"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="formGroup">
              <label htmlFor="email">Correo electrónico</label>
              <input
                id="email" name="email" type="email"
                placeholder="correo@ejemplo.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="formGroup">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password" name="password" type="password"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {errorMessage && <p className="unsavedWarning">{errorMessage}</p>}

            <button type="submit" className="primaryButton authButton" disabled={loading} style={{ width: "100%", marginTop: "8px" }}>
              {loading ? "Creando cuenta..." : "Registrarme"}
            </button>
          </form>

          <button className="linkButton" onClick={() => navigate("/login")} style={{ marginTop: "16px" }}>
            Ya tengo una cuenta
          </button>
        </div>
      </div>

    </div>
  );
}
