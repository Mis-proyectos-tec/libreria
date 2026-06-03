import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/appDataContext.jsx";
import { getBookCoverUrl } from "../services/booksService.js";
import EmptyState from "../components/EmptyState.jsx";

export default function ExplorarLibrosPage() {
  const navigate = useNavigate();
  const { books, users, loading, error } = useAppData();

  const [coverUrls, setCoverUrls] = useState({});

  const librosPublicos = useMemo(() => {
    return books.filter((book) => {
      const isPublic = book.isPublic ?? book.is_public ?? true;
      const status = book.currentStatus || book.current_status || "activo";
      return isPublic && status === "activo";
    });
  }, [books]);

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

  function openBookDetail(book) {
    navigate("/detalle-libro", { state: { libroId: book.id } });
  }

  function getCoverImage(book) {
    return coverUrls[book.id] || book.coverUrl || "/assets/defaultBook.png";
  }

  if (loading) return <p style={{ color: "var(--muted)" }}>Cargando libros...</p>;
  if (error) return <p className="unsavedWarning">{error}</p>;

  return (
    <section className="homePage">

      <div className="heroSection">
        <div className="heroContent">
          <span className="heroBadge">Biblioteca pública</span>
          <h1 className="heroTitle">Explorar libros</h1>
          <p className="heroText">
            Descubre los libros que otros usuarios han compartido en la plataforma.
          </p>
        </div>
      </div>

      <div className="sectionBlock">
        <div className="sectionHeader">
          <h2>Libros disponibles</h2>
          <span style={{ color: "var(--muted)", fontSize: "0.88rem" }}>
            {librosPublicos.length} {librosPublicos.length === 1 ? "libro" : "libros"}
          </span>
        </div>

        {librosPublicos.length === 0 ? (
          <EmptyState
            icon="◎"
            title="Sin libros publicados"
            text="Todavía no hay libros públicos. Sé el primero en subir uno."
          />
        ) : (
          <div className="booksGrid">
            {librosPublicos.map((book) => (
              <article
                key={book.id}
                className="bookCard"
                onClick={() => openBookDetail(book)}
              >
                <img
                  src={getCoverImage(book)}
                  alt={book.title || "Portada del libro"}
                  className="bookCardImage"
                />
                <div className="bookCardBody">
                  <h3 className="bookCardTitle">{book.title || "Libro sin título"}</h3>
                  <p className="bookCardAuthor">{book.author || "Autor desconocido"}</p>
                  <p style={{ fontSize: "0.76rem", color: "var(--muted)", margin: "4px 0 0" }}>
                    {getUploaderName(book)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

    </section>
  );
}
