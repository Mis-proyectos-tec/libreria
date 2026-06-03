import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BookCard from "../components/bookCard.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { useAuth } from "../context/authContext.jsx";
import { useAppData } from "../context/appDataContext.jsx";
import { deleteFavorite, getBookCoverUrl } from "../services/booksService.js";

export default function BibliotecaPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { books, categories, favorites, loading, error, reloadAppData } = useAppData();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [coverUrls, setCoverUrls] = useState({});

  const misRegistrosFavoritos = useMemo(() => {
    return favorites.filter((f) => String(f.userId) === String(currentUser?.id));
  }, [favorites, currentUser?.id]);

  const misLibros = useMemo(() => {
    if (!currentUser) return [];
    return books.filter((book) => String(book.userId) === String(currentUser.id));
  }, [books, currentUser]);

  const guardados = useMemo(() => {
    return books.filter((book) =>
      misRegistrosFavoritos.some((f) => String(f.bookId) === String(book.id)) &&
      String(book.userId) !== String(currentUser?.id)
    );
  }, [books, misRegistrosFavoritos, currentUser?.id]);

  const filteredMisLibros = useMemo(() => {
    return misLibros.filter((book) => {
      const matchesSearch =
        (book.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (book.author || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || book.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [misLibros, searchTerm, selectedCategory]);

  const filteredGuardados = useMemo(() => {
    return guardados.filter((book) => {
      const matchesSearch =
        (book.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (book.author || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || book.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [guardados, searchTerm, selectedCategory]);

  const totalBooks = useMemo(() => {
    if (filterType === "mis") return filteredMisLibros.length;
    if (filterType === "guardados") return filteredGuardados.length;
    return filteredMisLibros.length + filteredGuardados.length;
  }, [filterType, filteredMisLibros.length, filteredGuardados.length]);

  const displayMisLibros = filterType === "all" || filterType === "mis";
  const displayGuardados = filterType === "all" || filterType === "guardados";

  async function removerDeBiblioteca(bookId) {
    const registro = misRegistrosFavoritos.find(
      (f) => String(f.bookId) === String(bookId)
    );
    if (!registro) return;
    try {
      await deleteFavorite(registro.id);
      await reloadAppData();
    } catch (err) {
      console.error(err);
    }
  }

  async function loadCoverUrls() {
    const allBooks = [...misLibros, ...guardados];
    const covers = {};
    await Promise.all(
      allBooks.map(async (book) => {
        try {
          if (!book.cover_blob_name && !book.coverBlobName) return;
          const response = await getBookCoverUrl(book.id);
          if (response?.coverUrl) covers[book.id] = response.coverUrl;
        } catch (err) {
          console.warn(`No se pudo cargar la portada del libro ${book.id}`, err);
        }
      })
    );
    setCoverUrls(covers);
  }

  useMemo(() => {
    if (misLibros.length > 0 || guardados.length > 0) {
      loadCoverUrls();
    }
  }, [misLibros, guardados]);

  function getCoverImage(book) {
    return coverUrls[book.id] || book.coverUrl || "/assets/defaultBook.png";
  }

  if (!currentUser) return <section className="bibliotecaPage"><h1>Biblioteca</h1><p>Debes iniciar sesión.</p></section>;
  if (loading) return <section className="bibliotecaPage"><h1>Biblioteca</h1><p style={{ color: "var(--muted)" }}>Cargando libros...</p></section>;
  if (error) return <section className="bibliotecaPage"><h1>Biblioteca</h1><p className="unsavedWarning">{error}</p></section>;

  return (
    <section className="bibliotecaPage">

      <div className="sectionHeader">
        <div>
          <h1 style={{ margin: 0 }}>Mi Biblioteca</h1>
          <p style={{ margin: "4px 0 0", color: "var(--muted)", fontSize: "0.9rem" }}>
            {totalBooks} {totalBooks === 1 ? "libro" : "libros"}
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
            className={`filterPill${filterType === "all" ? " filterPillActive" : ""}`}
            onClick={() => setFilterType("all")}
          >
            Todos
          </button>
          <button
            className={`filterPill${filterType === "mis" ? " filterPillActive" : ""}`}
            onClick={() => setFilterType("mis")}
          >
            Mis libros
          </button>
          <button
            className={`filterPill${filterType === "guardados" ? " filterPillActive" : ""}`}
            onClick={() => setFilterType("guardados")}
          >
            Guardados
          </button>
        </div>

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

      {displayMisLibros && (
        <>
          {filteredMisLibros.length === 0 && !searchTerm && filterType !== "guardados" ? (
            <div style={{ marginTop: "40px" }}>
              <EmptyState
                icon="📚"
                title="Sin libros subidos"
                text="Sube tu primer libro para empezar."
                action={
                  <button className="primaryButton" onClick={() => navigate("/nuevo-libro")}>
                    Subir libro
                  </button>
                }
              />
            </div>
          ) : filteredMisLibros.length === 0 && searchTerm ? (
            <EmptyState
              icon="📚"
              title="Sin resultados"
              text="Prueba con otro término de búsqueda."
            />
          ) : (
            <>
              <div style={{ marginTop: "24px", marginBottom: "8px" }}>
                <h3 style={{ color: "var(--text-soft)", fontSize: "0.88rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, margin: 0 }}>
                  Mis libros ({filteredMisLibros.length})
                </h3>
              </div>
              <div className="booksGrid">
                {filteredMisLibros.map((book) => (
                  <div
                    key={book.id}
                    onClick={() => navigate("/detalle-libro", { state: { libroId: book.id } })}
                    style={{ cursor: "pointer" }}
                  >
                    <BookCard
                      titulo={book.title}
                      autor={book.author}
                      portada={getCoverImage(book)}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {displayGuardados && (
        <>
          {filteredGuardados.length === 0 && !searchTerm && filterType !== "mis" ? (
            <div style={{ marginTop: "40px" }}>
              <EmptyState
                icon="♡"
                title="Sin libros guardados"
                text="Explora la comunidad y guarda libros de otros usuarios."
                action={
                  <button className="primaryButton" onClick={() => navigate("/explorar-libros")}>
                    Explorar libros
                  </button>
                }
              />
            </div>
          ) : filteredGuardados.length > 0 ? (
            <>
              <div style={{ marginTop: "40px", marginBottom: "8px" }}>
                <h3 style={{ color: "var(--text-soft)", fontSize: "0.88rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, margin: 0 }}>
                  Libros guardados ({filteredGuardados.length})
                </h3>
              </div>
              <div className="booksGrid">
                {filteredGuardados.map((book) => (
                  <div key={book.id} className="guardadoCardWrapper">
                    <div
                      onClick={() => navigate("/detalle-libro", { state: { libroId: book.id } })}
                      style={{ cursor: "pointer" }}
                    >
                      <BookCard
                        titulo={book.title}
                        autor={book.author}
                        portada={getCoverImage(book)}
                      />
                    </div>
                    <button className="dangerButton" onClick={() => removerDeBiblioteca(book.id)}>
                      Quitar de biblioteca
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </>
      )}

    </section>
  );
}
