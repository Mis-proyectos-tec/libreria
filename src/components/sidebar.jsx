import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext.jsx";
import { useAppData } from "../context/appDataContext.jsx";

export default function Sidebar() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { books } = useAppData();

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("global-dark-mode") === "true"
  );

  useEffect(() => {
    localStorage.setItem("global-dark-mode", darkMode);
    document.body.classList.toggle("darkMode", darkMode);
  }, [darkMode]);

  const tieneLibros = books.some(
    (book) => String(book.userId) === String(currentUser?.id)
  );

  function getInitials(name = "") {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("");
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const linkClass = ({ isActive }) =>
    `sidebarLink${isActive ? " sidebarLinkActive" : ""}`;

  return (
    <aside className="sidebar">

      <div className="sidebarBrand">
        <span className="sidebarLogo">Biblio-TEC</span>
        <span className="sidebarTagline">Biblioteca digital</span>
      </div>

      <nav className="sidebarNav">
        <NavLink to="/home"            className={linkClass}>
          <span className="sidebarIcon">⌂</span> Inicio
        </NavLink>
        <NavLink to="/biblioteca"      className={linkClass}>
          <span className="sidebarIcon">▤</span> Mi Biblioteca
        </NavLink>
        <NavLink to="/explorar-libros" className={linkClass}>
          <span className="sidebarIcon">◎</span> Explorar
        </NavLink>
        <NavLink to="/favoritos"       className={linkClass}>
          <span className="sidebarIcon">♡</span> Favoritos
        </NavLink>
        <NavLink to="/perfil"          className={linkClass}>
          <span className="sidebarIcon">◯</span> Perfil
        </NavLink>
      </nav>

      {tieneLibros && (
        <div className="sidebarSection">
          <span className="sidebarSectionLabel">Administración</span>
          <NavLink to="/admin-libros" className={linkClass}>
            <span className="sidebarIcon">✎</span> Mis libros
          </NavLink>
          <NavLink to="/nuevo-libro" className={linkClass}>
            <span className="sidebarIcon">+</span> Nuevo libro
          </NavLink>
        </div>
      )}

      <div className="sidebarFooter">
        <div className="sidebarUser" onClick={() => navigate("/perfil")}>
          <div className="sidebarAvatar">{getInitials(currentUser?.name)}</div>
          <div className="sidebarUserInfo">
            <span className="sidebarUserName">{currentUser?.name}</span>
            <span className="sidebarUserEmail">{currentUser?.email}</span>
          </div>
        </div>
        <button
          className="sidebarThemeToggle"
          onClick={() => setDarkMode((prev) => !prev)}
        >
          {darkMode ? "☀ Modo claro" : "🌙 Modo oscuro"}
        </button>
        <button className="sidebarLogout" onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>

    </aside>
  );
}
