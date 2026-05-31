import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/navBar.jsx";

import HomePage from "./pages/homePage.jsx";
import LoginPage from "./pages/loginPage.jsx";
import RegistroPage from "./pages/registroPage.jsx";
import BibliotecaPage from "./pages/bibliotecaPage.jsx";
import FavoritosPage from "./pages/favoritosPage.jsx";
import PerfilPage from "./pages/perfilPage.jsx";
import DetalleLibroPage from "./pages/detalleLibroPage.jsx";
import LecturaPage from "./pages/lecturaPage.jsx";
import AdminLibrosPage from "./pages/adminLibrosPage.jsx";
import FormLibroPage from "./pages/formLibroPage.jsx";

import { useAuth } from "./context/authContext.jsx";

export default function App() {

  const { isAuthenticated } = useAuth();

  return (
    <div className="appShell">

      {/* navbar solo si hay usuario logueado */}
      {isAuthenticated && <Navbar />}

      <main className="mainContent">

        <Routes>

          {/* ruta inicial */}
          <Route
            path="/"
            element={
              isAuthenticated
                ? <Navigate to="/home" />
                : <Navigate to="/login" />
            }
          />

          {/* login */}
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/home" /> : <LoginPage />}
          />

          {/* registro */}
          <Route
            path="/registro"
            element={isAuthenticated ? <Navigate to="/home" /> : <RegistroPage />}
          />

          {/* home */}
          <Route
            path="/home"
            element={
              isAuthenticated
                ? <HomePage />
                : <Navigate to="/login" />
            }
          />

          {/* biblioteca */}
          <Route
            path="/biblioteca"
            element={
              isAuthenticated
                ? <BibliotecaPage />
                : <Navigate to="/login" />
            }
          />

          {/* favoritos */}
          <Route
            path="/favoritos"
            element={
              isAuthenticated
                ? <FavoritosPage />
                : <Navigate to="/login" />
            }
          />

          {/* perfil usuario */}
          <Route
            path="/perfil"
            element={
              isAuthenticated
                ? <PerfilPage />
                : <Navigate to="/login" />
            }
          />

          {/* detalle libro */}
          <Route
            path="/detalle-libro"
            element={
              isAuthenticated
                ? <DetalleLibroPage />
                : <Navigate to="/login" />
            }
          />

          {/* lector pdf */}
          <Route
            path="/lectura"
            element={
              isAuthenticated
                ? <LecturaPage />
                : <Navigate to="/login" />
            }
          />

          {/* admin libros */}
          <Route
            path="/admin-libros"
            element={
              isAuthenticated
                ? <AdminLibrosPage />
                : <Navigate to="/login" />
            }
          />

          {/* nuevo / editar libro */}
          <Route
            path="/nuevo-libro"
            element={
              isAuthenticated
                ? <FormLibroPage />
                : <Navigate to="/login" />
            }
          />
          <Route
            path="/editar-libro"
            element={
              isAuthenticated
                ? <FormLibroPage />
                : <Navigate to="/login" />
            }
          />

        </Routes>

      </main>

    </div>
  );
}