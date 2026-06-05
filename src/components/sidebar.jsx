import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext.jsx";
import { useAppData } from "../context/appDataContext.jsx";
import {
  startNotificationsConnection,
  stopNotificationsConnection,
} from "../services/notificationsService.js";

export default function Sidebar() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { books } = useAppData();

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("global-dark-mode") === "true"
  );

  useEffect(() => {
    localStorage.setItem("global-dark-mode", darkMode);
    document.body.classList.toggle("darkMode", darkMode);
  }, [darkMode]);

  useEffect(() => {
    const userId =
      currentUser?.id ||
      currentUser?.userId ||
      currentUser?.user_id ||
      currentUser?.uid ||
      currentUser?.firebaseUid ||
      currentUser?.firebaseUuid ||
      null;

    if (!userId) {
      return;
    }

    let active = true;

    startNotificationsConnection(userId, (notification) => {
      if (!active) return;

      setNotifications((prev) => [notification, ...prev].slice(0, 10));
    }).catch(() => {
      console.error("No se pudo conectar al servicio de notificaciones.");
    });

    return () => {
      active = false;
      stopNotificationsConnection().catch(() => {});
    };
  }, [
    currentUser?.id,
    currentUser?.userId,
    currentUser?.user_id,
    currentUser?.uid,
    currentUser?.firebaseUid,
    currentUser?.firebaseUuid,
  ]);

  const currentUserId =
    currentUser?.id ||
    currentUser?.userId ||
    currentUser?.user_id ||
    currentUser?.uid ||
    currentUser?.firebaseUid ||
    currentUser?.firebaseUuid ||
    null;

  const tieneLibros = books.some((book) => {
    const ownerId =
      book.user_id ||
      book.userId ||
      book.uploaded_by ||
      book.uploadedBy ||
      null;

    return currentUserId && ownerId && String(ownerId) === String(currentUserId);
  });

  function getInitials(name = "") {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
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
        <NavLink to="/home" className={linkClass}>
          <span className="sidebarIcon">⌂</span> Inicio
        </NavLink>

        <NavLink to="/biblioteca" className={linkClass}>
          <span className="sidebarIcon">▤</span> Mi Biblioteca
        </NavLink>

        <NavLink to="/explorar-libros" className={linkClass}>
          <span className="sidebarIcon">◎</span> Explorar
        </NavLink>

        <NavLink to="/perfil" className={linkClass}>
          <span className="sidebarIcon">◯</span> Perfil
        </NavLink>
      </nav>

      <div className="sidebarSection">
        <button
          type="button"
          className="sidebarNotificationButton"
          onClick={() => setShowNotifications((prev) => !prev)}
        >
          <span className="sidebarIcon">🔔</span>
          Notificaciones

          {notifications.length > 0 && (
            <span className="sidebarNotificationBadge">
              {notifications.length}
            </span>
          )}
        </button>

        {showNotifications && (
          <div className="sidebarNotificationPanel">
            {notifications.length === 0 ? (
              <p className="sidebarNotificationEmpty">
                No tienes notificaciones nuevas.
              </p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id || notification.createdAt}
                  className="sidebarNotificationItem"
                >
                  <strong>{notification.type || "Notificación"}</strong>

                  <p>
                    {notification.message || "Tienes una nueva notificación."}
                  </p>

                  <small>
                    {notification.createdAt
                      ? new Date(notification.createdAt).toLocaleString()
                      : ""}
                  </small>
                </div>
              ))
            )}
          </div>
        )}
      </div>

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