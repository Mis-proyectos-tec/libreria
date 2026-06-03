import { NavLink } from "react-router-dom";

export default function BottomNav() {
  const linkClass = ({ isActive }) =>
    `bottomNavItem${isActive ? " bottomNavItemActive" : ""}`;

  return (
    <nav className="bottomNav">
      <div className="bottomNavInner">
        <NavLink to="/home" className={linkClass}>
          <span className="bottomNavIcon">⌂</span>
          Inicio
        </NavLink>
        <NavLink to="/biblioteca" className={linkClass}>
          <span className="bottomNavIcon">▤</span>
          Biblioteca
        </NavLink>
        <NavLink to="/explorar-libros" className={linkClass}>
          <span className="bottomNavIcon">◎</span>
          Explorar
        </NavLink>
        <NavLink to="/perfil" className={linkClass}>
          <span className="bottomNavIcon">◯</span>
          Perfil
        </NavLink>
      </div>
    </nav>
  );
}
