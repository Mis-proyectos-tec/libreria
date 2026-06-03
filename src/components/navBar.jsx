import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext.jsx";

export default function Navbar() {
  const navigate = useNavigate();
  const { currentUser, logout, isAuthenticated } = useAuth();

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("global-dark-mode") === "true"
  );

  useEffect(() => {
    localStorage.setItem("global-dark-mode", darkMode);
    document.body.classList.toggle("darkMode", darkMode);
  }, [darkMode]);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function getInitials(name = "") {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("");
  }

  return (
    <header className="navbar">
      <div onClick={() => navigate("/home")} style={{ cursor: "pointer" }}>
        <h1 className="navbarTitle">ReadFlow - Biblioteca</h1>
        <p className="navbarSubtitle">
          Bienvenido, {currentUser?.name}
        </p>
      </div>

      {isAuthenticated && (
        <div className="navbarActions">
          <button
            className="secondaryButton"
            onClick={() => navigate("/home")}
          >
            Inicio
          </button>

          <button
            className="themeButton"
            onClick={() => setDarkMode((prev) => !prev)}
          >
            {darkMode ? "☀ Claro" : "🌙 Oscuro"}
          </button>

          <button
            className="secondaryButton"
            onClick={() => navigate("/biblioteca")}
          >
            Biblioteca
          </button>

          <button
            className="secondaryButton"
            onClick={() => navigate("/explorar-libros")}
          >
            Explorar
          </button>

          <button
            className="secondaryButton"
            onClick={() => navigate("/favoritos")}
          >
            Favoritos
          </button>

          <button
            className="secondaryButton"
            onClick={() => navigate("/admin-libros")}
          >
            Admin
          </button>

          <button
            className="userProfileButton"
            onClick={() => navigate("/perfil")}
          >
            <span className="userIcon">👤</span>
            <span className="userInitials">
              {getInitials(currentUser?.name)}
            </span>
          </button>

          <button className="secondaryButton" onClick={handleLogout}>
            Salir
          </button>
        </div>
      )}
    </header>
  );
}