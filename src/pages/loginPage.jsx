import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext.jsx";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

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
      await login(formData.email, formData.password);
      navigate("/home");
    } catch (error) {
      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        setErrorMessage("Correo o contraseña incorrectos.");
      } else if (error.code === "auth/too-many-requests") {
        setErrorMessage("Demasiados intentos. Espere un momento e intente de nuevo.");
      } else {
        setErrorMessage("Error al iniciar sesión. Intente de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="authPage">
      <div className="authCard">
        <h1>Iniciar sesión</h1>

        <form onSubmit={handleSubmit}>
          <div className="formGroup">
            <label>Correo</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Ingresa tu correo"
            />
          </div>

          <div className="formGroup">
            <label>Contraseña</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Ingresa tu contraseña"
            />
          </div>

          {errorMessage && <p className="unsavedWarning">{errorMessage}</p>}

          <button className="primaryButton" type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <button className="linkButton" onClick={() => navigate("/registro")}>
          ¿No tienes cuenta? Regístrate
        </button>
      </div>
    </section>
  );
}
