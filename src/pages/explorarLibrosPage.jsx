import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext.jsx";
import { useBooks } from "../hooks/useBooks.js";
import { useCategories } from "../hooks/useCategories.js";
import { useFavorites } from "../hooks/useFavorites.js";
import { createFavorite, deleteFavorite, getBookCoverUrl } from "../services/booksService.js";
import EmptyState from "../components/EmptyState.jsx";
import Spinner from "../components/Spinner.jsx";
import CoverImage from "../components/CoverImage.jsx";
import Pagination from "../components/Pagination.jsx";

const PAGE_SIZE = 5;

export default function ExplorarLibrosPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { books, loading, error } = useBooks();
  const { categories } = useCategories();
  const { favorites, reloadFavorites } = useFavorites();

  const [coverUrls, setCoverUrls] = useState({});
  const [loadingBib, setLoadingBib] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [pageMios, setPageMios] = useState(1);
  const [pageComunidad, setPageComunidad] = useState(1);

  const librosPublicos = useMemo(() => {
    return books.filter((book) => {
      const isPublic = book.isPublic ?? book.is_public ?? true;
      const status = book.currentStatus || book.current_status || "activo";
      return isPublic && status === "activo";
    });
  }, [books]);

  const misRegistrosFavoritos = useMemo(() => {
    return favorites.filter((f) => String(f.userId) === String(currentUser?.id));
  }, [favorites, currentUser?.id]);

  const applyFilters = (list) =>
    list.filter((b) => {
      const matchesSearch =
        (b.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.author || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || b.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

  const librosDeOtros = useMemo(() => {
    return applyFilters(
      librosPublicos.filter((b) => String(b.userId) !== String(currentUser?.id))
    );
  }, [librosPublicos, currentUser?.id, searchTerm, selectedCategory]);

  const misPublicaciones = useMemo(() => {
    return applyFilters(
      librosPublicos.filter((b) => String(b.userId) === String(currentUser?.id))
    );
  }, [librosPublicos, currentUser?.id, searchTerm, selectedCategory]);

  useEffect(() => {
    setPageMios(1);
    setPageComunidad(1);
  }, [searchTerm, selectedCategory]);

  const isEnBiblioteca = (bookId) => {
    return misRegistrosFavoritos.some((f) => String(f.bookId) === String(bookId));
  };

  useEffect(() => {
    async function loadCoverUrls() {
      const covers = {};
      await Promise.all(
        librosPublicos.map(async (book) => {
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
    if (librosPublicos.length > 0) loadCoverUrls();
  }, [librosPublicos]);

  function getCoverImage(book) {
    return coverUrls[book.id] || book.coverUrl || "/assets/defaultBook.png";
  }

  async function toggleBiblioteca(book) {
    setLoadingBib((prev) => ({ ...prev, [book.id]: true }));
    try {
      const registro = misRegistrosFavoritos.find(
        (f) => String(f.bookId) === String(book.id)
      );
      if (registro) {
        await deleteFavorite(registro.id);
      } else {
        await createFavorite({ userId: currentUser.id, bookId: book.id });
      }
      await reloadFavorites();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBib((prev) => ({ ...prev, [book.id]: false }));
    }
  }

  if (error) return <p className="unsavedWarning">{error}</p>;

  return (
    <section className="explorarPage">

      <div className="bibliotecaToolbar" style={{ marginBottom: "48px" }}>
        <input
          type="text"
          className="searchInput"
          placeholder="Buscar por título o autor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="filterPills">
          <select
            className="filterPillSelect"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>{category.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Sección: Subidos por mí */}
      {librosPublicos.some((b) => String(b.userId) === String(currentUser?.id)) && (
        <div className="sectionBlock">
          <div className="sectionHeader">
            <h2>Subidos por mí</h2>
            <span style={{ color: "var(--muted)", fontSize: "0.88rem" }}>
              {misPublicaciones.length} {misPublicaciones.length === 1 ? "libro" : "libros"}
            </span>
          </div>

          {loading ? <Spinner inline /> : misPublicaciones.length === 0 ? (
            <EmptyState icon="📚" title="Sin resultados" text="Ningún libro tuyo coincide con la búsqueda." />
          ) : (
            <>
              <div className="booksGrid">
                {misPublicaciones.slice((pageMios - 1) * PAGE_SIZE, pageMios * PAGE_SIZE).map((book) => (
                  <article key={book.id} className="explorCard">
                    <CoverImage
                      src={getCoverImage(book)}
                      alt={book.title || "Portada del libro"}
                      className="explorCardImage"
                    />
                    <div className="explorCardBody">
                      <h3 className="explorCardTitle">{book.title || "Libro sin título"}</h3>
                      <p className="explorCardAuthor">{book.author || "Autor desconocido"}</p>
                      <span className="explorCardBadge explorCardBadgeYours">Tuyo</span>
                    </div>
                    <div className="explorCardActions">
                      <button
                        className="primaryButton"
                        onClick={() => navigate("/detalle-libro", { state: { libroId: book.id } })}
                        style={{ flex: 1 }}
                      >
                        Ver en biblioteca
                      </button>
                    </div>
                  </article>
                ))}
              </div>
              <Pagination
                currentPage={pageMios}
                totalPages={Math.ceil(misPublicaciones.length / PAGE_SIZE)}
                onPageChange={setPageMios}
              />
            </>
          )}
        </div>
      )}

      {/* Sección: De la comunidad */}
      <div className="sectionBlock">
        <div className="sectionHeader">
          <h2>De la comunidad</h2>
          <span style={{ color: "var(--muted)", fontSize: "0.88rem" }}>
            {librosDeOtros.length} {librosDeOtros.length === 1 ? "libro" : "libros"}
          </span>
        </div>

        {loading ? <Spinner inline /> : librosDeOtros.length === 0 ? (
          <EmptyState
            icon="◎"
            title={searchTerm || selectedCategory !== "all" ? "Sin resultados" : "Sin libros de la comunidad"}
            text={searchTerm || selectedCategory !== "all" ? "Ningún libro coincide con la búsqueda." : "Todavía no hay libros públicos de otros usuarios."}
          />
        ) : (
          <>
            <div className="booksGrid">
              {librosDeOtros.slice((pageComunidad - 1) * PAGE_SIZE, pageComunidad * PAGE_SIZE).map((book) => (
                <article key={book.id} className="explorCard">
                  <img
                    src={getCoverImage(book)}
                    alt={book.title || "Portada del libro"}
                    className="explorCardImage"
                  />
                  <div className="explorCardBody">
                    <h3 className="explorCardTitle">{book.title || "Libro sin título"}</h3>
                    <p className="explorCardAuthor">
                      <strong>Autor:</strong> {book.author || "Autor desconocido"}
                    </p>
                    {book.description && (
                      <p className="explorCardDescription">{book.description}</p>
                    )}
                    {isEnBiblioteca(book.id) && (
                      <span className="explorCardBadge">✓ En tu biblioteca</span>
                    )}
                  </div>
                  <div className="explorCardActions">
                    <button
                      className="secondaryButton"
                      onClick={() => navigate("/detalle-libro", { state: { libroId: book.id } })}
                    >
                      Ver detalle
                    </button>
                    <button
                      className={isEnBiblioteca(book.id) ? "secondaryButton" : "primaryButton"}
                      onClick={() => toggleBiblioteca(book)}
                      disabled={loadingBib[book.id]}
                    >
                      {loadingBib[book.id]
                        ? "..."
                        : isEnBiblioteca(book.id)
                        ? "Quitar"
                        : "Agregar a mi biblioteca"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
            <Pagination
              currentPage={pageComunidad}
              totalPages={Math.ceil(librosDeOtros.length / PAGE_SIZE)}
              onPageChange={setPageComunidad}
            />
          </>
        )}
      </div>

    </section>
  );
}
