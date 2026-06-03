import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext.jsx";
import { useAppData } from "../context/appDataContext.jsx";
import { createFavorite, deleteFavorite, getBookCoverUrl } from "../services/booksService.js";
import EmptyState from "../components/EmptyState.jsx";

export default function ExplorarLibrosPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { books, users, favorites, loading, error, reloadAppData } = useAppData();

  const [coverUrls, setCoverUrls] = useState({});
  const [loadingBib, setLoadingBib] = useState({});

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

  const librosDeOtros = useMemo(() => {
    return librosPublicos.filter((b) => String(b.userId) !== String(currentUser?.id));
  }, [librosPublicos, currentUser?.id]);

  const misPublicaciones = useMemo(() => {
    return librosPublicos.filter((b) => String(b.userId) === String(currentUser?.id));
  }, [librosPublicos, currentUser?.id]);

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

  function getUploaderName(book) {
    const userId = book.userId || book.user_id;
    if (!userId || !users) return "Usuario desconocido";
    const user = users.find((item) => String(item.id) === String(userId));
    if (!user) return "Usuario desconocido";
    return user.name || user.fullName || user.username || user.email || "Usuario";
  }

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
      await reloadAppData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBib((prev) => ({ ...prev, [book.id]: false }));
    }
  }

  if (loading) return <p style={{ color: "var(--muted)" }}>Cargando libros...</p>;
  if (error) return <p className="unsavedWarning">{error}</p>;

  return (
    <section className="explorarPage">

      <div className="heroSection">
        <div className="heroContent">
          <span className="heroBadge">Biblioteca pública</span>
          <h1 className="heroTitle">Explorar libros</h1>
          <p className="heroText">
            Descubre los libros que otros usuarios han compartido en la plataforma.
          </p>
        </div>
      </div>

      {/* Sección: Subidos por mí */}
      {misPublicaciones.length > 0 && (
        <div className="sectionBlock">
          <div className="sectionHeader">
            <h2>Subidos por mí</h2>
            <span style={{ color: "var(--muted)", fontSize: "0.88rem" }}>
              {misPublicaciones.length} {misPublicaciones.length === 1 ? "libro" : "libros"}
            </span>
          </div>

          <div className="booksGrid">
            {misPublicaciones.map((book) => (
              <article key={book.id} className="explorCard">
                <img
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

        {librosDeOtros.length === 0 ? (
          <EmptyState
            icon="◎"
            title="Sin libros de la comunidad"
            text="Todavía no hay libros públicos de otros usuarios."
          />
        ) : (
          <div className="booksGrid">
            {librosDeOtros.map((book) => (
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
                  <p className="explorCardUploader">
                    Subido por{" "}
                    <button
                      className="explorCardUploaderLink"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate("/perfil-usuario", { state: { usuarioId: book.userId || book.user_id } });
                      }}
                    >
                      <strong>{getUploaderName(book)}</strong>
                    </button>
                  </p>
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
        )}
      </div>

    </section>
  );
}
