import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BookCard from "../components/bookCard.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { useAuth } from "../context/authContext.jsx";
import { useAppData } from "../context/appDataContext.jsx";

export default function BibliotecaPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { books, categories, loading, error } = useAppData();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const userBooks = useMemo(() => {
    if (!currentUser) return [];
    return books.filter((book) => book.userId === currentUser.id);
  }, [books, currentUser]);

  const filteredBooks = useMemo(() => {
    return userBooks.filter((book) => {
      const matchesSearch =
        (book.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (book.author || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || book.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [userBooks, searchTerm, selectedCategory]);

  if (!currentUser) return <section className="bibliotecaPage"><h1>Biblioteca</h1><p>Debes iniciar sesión.</p></section>;
  if (loading) return <section className="bibliotecaPage"><h1>Biblioteca</h1><p style={{ color: "var(--muted)" }}>Cargando libros...</p></section>;
  if (error) return <section className="bibliotecaPage"><h1>Biblioteca</h1><p className="unsavedWarning">{error}</p></section>;

  return (
    <section className="bibliotecaPage">

      <div className="sectionHeader">
        <div>
          <h1 style={{ margin: 0 }}>Mi Biblioteca</h1>
          <p style={{ margin: "4px 0 0", color: "var(--muted)", fontSize: "0.9rem" }}>
            {userBooks.length} {userBooks.length === 1 ? "libro" : "libros"}
          </p>
        </div>
        <button className="primaryButton" onClick={() => navigate("/nuevo-libro")}>
          + Nuevo libro
        </button>
      </div>

      <div className="bibliotecaToolbar">
        <input
          type="text"
          className="searchInput"
          placeholder="Buscar por título o autor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="filterPills">
          <button
            className={`filterPill${selectedCategory === "all" ? " filterPillActive" : ""}`}
            onClick={() => setSelectedCategory("all")}
          >
            Todas
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              className={`filterPill${selectedCategory === category.name ? " filterPillActive" : ""}`}
              onClick={() => setSelectedCategory(category.name)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {filteredBooks.length === 0 ? (
        <EmptyState
          icon="📚"
          title={searchTerm ? "Sin resultados" : "Biblioteca vacía"}
          text={searchTerm ? "Prueba con otro término de búsqueda." : "Sube tu primer libro para empezar."}
          action={
            !searchTerm && (
              <button className="primaryButton" onClick={() => navigate("/nuevo-libro")}>
                Subir libro
              </button>
            )
          }
        />
      ) : (
        <div className="booksGrid">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              onClick={() => navigate("/detalle-libro", { state: { libroId: book.id } })}
              style={{ cursor: "pointer" }}
            >
              <BookCard
                titulo={book.title}
                autor={book.author}
                portada={book.coverUrl || "/assets/defaultBook.png"}
              />
            </div>
          ))}
        </div>
      )}

    </section>
  );
}
