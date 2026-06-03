import { NavLink } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebarTop">
        <h2 className="logo">ReadFlow</h2>
        <p className="sidebarText">Lectura simple y organizada</p>
      </div>

      <nav className="sidebarNav">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/biblioteca">Biblioteca</NavLink>
        <NavLink to="/lectura">Lectura</NavLink>
        <NavLink to="/admin-libros">Administrar libros</NavLink>
      </nav>
    </aside>
  );
}