import { Routes, Route } from "react-router-dom";
import MainLayout from "./layout/mainLayout.jsx";

import HomePage from "./pages/homePage.jsx";
import BibliotecaPage from "./pages/bibliotecaPage.jsx";
import LecturaPage from "./pages/lecturaPage.jsx";
import AdminLibrosPage from "./pages/adminLibrosPage.jsx";
import ConfiguracionPage from "./pages/configuracionPage.jsx";
import FormLibroPage from "./pages/formLibroPage.jsx";
import DetalleLibroPage from "./pages/detalleLibroPage.jsx";
import LoginPage from "./pages/loginPage.jsx";
import RegistroPage from "./pages/registroPage.jsx";
import PerfilPage from "./pages/perfilPage.jsx";
import MiBibliotecaPage from "./pages/miBibliotecaPage.jsx";
import BooksPage from "./peticiones_Azure/BooksPage.jsx";
import UsersPage from "./peticiones_Azure/UsersPage.jsx";



export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegistroPage />} />

      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="biblioteca" element={<BibliotecaPage />} />
        <Route path="libros" element={<BooksPage />} />
        <Route path="usuarios" element={<UsersPage />} />
        <Route path="mi-biblioteca" element={<MiBibliotecaPage />} />
        <Route path="lectura" element={<LecturaPage />} />
        <Route path="admin-libros" element={<AdminLibrosPage />} />
        <Route path="configuracion" element={<ConfiguracionPage />} />
        <Route path="nuevo-libro" element={<FormLibroPage />} />
        <Route path="editar-libro" element={<FormLibroPage />} />
        <Route path="detalle-libro" element={<DetalleLibroPage />} />
        <Route path="perfil" element={<PerfilPage />} />
      </Route>
    </Routes>
  );
}




