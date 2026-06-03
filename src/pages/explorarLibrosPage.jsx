import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/appDataContext.jsx";
import { getBookCoverUrl } from "../services/booksService.js";

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
            if (!book.cover_blob_name && !book.coverBlobName) {
              return;
            }

            const response = await getBookCoverUrl(book.id);

            if (response?.coverUrl) {
              covers[book.id] = response.coverUrl;
            }
          } catch (err) {
            console.warn(
              `No se pudo cargar la portada del libro ${book.id}`,
              err
            );
          }
        })
      );

      setCoverUrls(covers);
    }

    if (librosPublicos.length > 0) {
      loadCoverUrls();
    }
  }, [librosPublicos]);

  function getUploaderName(book) {
    const userId = book.userId || book.user_id;

    if (!userId || !users) {
      return "Usuario desconocido";
    }

    const user = users.find((item) => String(item.id) === String(userId));

    if (!user) {
      return "Usuario desconocido";
    }

    return user.name || user.fullName || user.username || user.email || "Usuario";
  }

  function openBookDetail(book) {
    navigate("/detalle-libro", {
      state: {
        libroId: book.id,
      },
    });
  }

  function getCoverImage(book) {
    return (
      coverUrls[book.id] ||
      book.coverUrl ||
      "/assets/defaultBook.png"
    );
  }

  if (loading) {
    return <p>Cargando libros...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <section className="homePage">
      <div className="heroSection">
        <span className="heroBadge">Biblioteca pública</span>
        <h1 className="heroTitle">Explorar libros publicados</h1>
        <p className="heroText">
          Aquí puedes ver los libros que otros usuarios han compartido en la
          plataforma. Toca una portada para abrir el detalle del libro.
        </p>
      </div>

      <div className="sectionBlock">
        <div className="sectionHeader">
          <h2>Libros disponibles</h2>
        </div>

        {librosPublicos.length === 0 ? (
          <p>No hay libros publicados todavía.</p>
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

                <h3 className="bookCardTitle">
                  {book.title || "Libro sin título"}
                </h3>

                <p className="bookCardAuthor">
                  {book.author || "Autor no especificado"}
                </p>

                <p className="bookCardProgressText">
                  Subido por: {getUploaderName(book)}
                </p>

                <p className="bookCardProgressText">
                  {book.description || "Sin descripción disponible."}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}