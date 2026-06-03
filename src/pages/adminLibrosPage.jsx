import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteBook } from "../services/booksService.js";
import { useAuth } from "../context/authContext.jsx";
import { useAppData } from "../context/appDataContext.jsx";
import EmptyState from "../components/EmptyState.jsx";

export default function AdminLibrosPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { books, loading, error, reloadAppData } = useAppData();

  const [searchTerm, setSearchTerm] = useState("");

  const librosUsuario = useMemo(() => {
    return books.filter((book) => book.userId === currentUser?.id);
  }, [books, currentUser]);

  const filteredBooks = useMemo(() => {
    return librosUsuario.filter((book) => {
      return (
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [librosUsuario, searchTerm]);

  async function handleDelete(id) {
    const confirmDelete = window.confirm("¿Deseas eliminar este libro?");
    if (!confirmDelete) return;
    try {
      await deleteBook(id);
      await reloadAppData();
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar el libro.");
    }
  }

  if (!currentUser) return <p>Debes iniciar sesión.</p>;
  if (loading) return <p style={{ color: "var(--muted)" }}>Cargando...</p>;
  if (error) return <p className="unsavedWarning">{error}</p>;

  return (
    <section className="adminPage">

      <div className="adminHeader">
        <div>
          <h1 style={{ margin: 0 }}>Mis libros</h1>
          <p style={{ margin: "4px 0 0", color: "var(--muted)", fontSize: "0.9rem" }}>
            {librosUsuario.length} {librosUsuario.length === 1 ? "libro" : "libros"} en tu cuenta
          </p>
        </div>
        <button className="primaryButton" onClick={() => navigate("/nuevo-libro")}>
          + Nuevo libro
        </button>
      </div>

      <div className="adminToolbar">
        <input
          type="text"
          placeholder="Buscar por título o autor..."
          className="searchInput adminSearch"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredBooks.length === 0 ? (
        <EmptyState
          icon="✎"
          title={searchTerm ? "Sin resultados" : "Sin libros"}
          text={searchTerm ? "Prueba con otro término." : "Sube tu primer libro para verlo aquí."}
          action={
            !searchTerm && (
              <button className="primaryButton" onClick={() => navigate("/nuevo-libro")}>
                Subir libro
              </button>
            )
          }
        />
      ) : (
        <div className="tableContainer">
          <table className="booksTable">
            <thead>
              <tr>
                <th>Portada</th>
                <th>Título</th>
                <th>Autor</th>
                <th>Categoría</th>
                <th>Páginas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map((book) => (
                <tr key={book.id}>
                  <td>
                    <img
                      src={book.coverUrl || "/assets/defaultBook.png"}
                      alt={book.title}
                      className="tableBookImage"
                    />
                  </td>
                  <td style={{ fontWeight: 500 }}>{book.title}</td>
                  <td style={{ color: "var(--muted)" }}>{book.author}</td>
                  <td>{book.category}</td>
                  <td>{book.totalPages}</td>
                  <td>
                    <div className="tableActions">
                      <button
                        className="editButton"
                        onClick={() => navigate("/editar-libro", { state: { libroId: book.id } })}
                      >
                        Editar
                      </button>
                      <button
                        className="deleteButton"
                        onClick={() => handleDelete(book.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </section>
  );
}
