import { Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./layout/mainLayout.jsx";

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
import ExplorarLibrosPage from "./pages/explorarLibrosPage.jsx";

import { useAuth } from "./context/authContext.jsx";

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>

      {/* Rutas públicas — sin layout */}
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/home" /> : <Navigate to="/login" />}
      />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/home" /> : <LoginPage />}
      />
      <Route
        path="/registro"
        element={isAuthenticated ? <Navigate to="/home" /> : <RegistroPage />}
      />

      {/* Rutas protegidas — con MainLayout como wrapper */}
      <Route element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" />}>
        <Route path="/home"            element={<HomePage />} />
        <Route path="/biblioteca"      element={<BibliotecaPage />} />
        <Route path="/explorar-libros" element={<ExplorarLibrosPage />} />
        <Route path="/favoritos"       element={<FavoritosPage />} />
        <Route path="/perfil"          element={<PerfilPage />} />
        <Route path="/detalle-libro"   element={<DetalleLibroPage />} />
        <Route path="/lectura"         element={<LecturaPage />} />
        <Route path="/admin-libros"    element={<AdminLibrosPage />} />
        <Route path="/nuevo-libro"     element={<FormLibroPage />} />
        <Route path="/editar-libro"    element={<FormLibroPage />} />
      </Route>

    </Routes>
  );
}
