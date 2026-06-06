import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppData } from "../context/appDataContext.jsx";
import { getBookCoverUrl } from "../services/booksService.js";
import EmptyState from "../components/EmptyState.jsx";

export default function PerfilUsuarioPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { books, loading, error, loadBooks } = useAppData();

  useEffect(() => { loadBooks(); }, []);
  const [coverUrls, setCoverUrls] = useState({});

  const usuarioId = location.state?.usuarioId;

  const usuario = location.state?.usuario || null;

  const librosSubidos = useMemo(() => {
    if (!usuario) return [];
    return books.filter((b) => String(b.userId) === String(usuario.id));
  }, [books, usuario]);

  useEffect(() => {
    if (librosSubidos.length === 0) return;
    const covers = {};
    Promise.all(
      librosSubidos.map(async (book) => {
        if (!book.cover_blob_name && !book.coverBlobName) return;
        try {
          const response = await getBookCoverUrl(book.id);
          if (response?.coverUrl) covers[book.id] = response.coverUrl;
        } catch {}
      })
    ).then(() => setCoverUrls(covers));
  }, [librosSubidos]);

  function getCoverImage(book) {
    return coverUrls[book.id] || book.coverUrl || "/assets/defaultBook.png";
  }

  if (loading) return <p style={{ color: "var(--muted)" }}>Cargando perfil...</p>;
  if (error) return <p className="unsavedWarning">{error}</p>;
  if (!usuarioId || !usuario) return <p>Usuario no encontrado.</p>;

  return (
    <section className="perfilUsuarioPage">
      <div className="perfilUsuarioCard">
        <div className="perfilUsuarioHeader">
          <div className="perfilUsuarioAvatar">
            {usuario.initials || usuario.name?.split(" ").map((w) => w[0].toUpperCase()).join("") || "?"}
          </div>
          <div className="perfilUsuarioInfo">
            <h1>{usuario.name}</h1>
            <p className="perfilUsuarioEmail">@{usuario.username}</p>
          </div>
          <button className="secondaryButton" onClick={() => navigate(-1)}>
            ← Volver
          </button>
        </div>

        <div className="perfilUsuarioStats">
          <div className="statBox">
            <p className="statNumber">{librosSubidos.length}</p>
            <p className="statLabel">Libros subidos</p>
          </div>
        </div>

        {librosSubidos.length === 0 ? (
          <EmptyState
            icon="📚"
            title="Sin libros subidos"
            text="Este usuario aún no ha subido libros."
          />
        ) : (
          <>
            <div className="sectionBlock">
              <div className="sectionHeader">
                <h2>Libros subidos</h2>
                <span style={{ color: "var(--muted)", fontSize: "0.88rem" }}>
                  {librosSubidos.length} {librosSubidos.length === 1 ? "libro" : "libros"}
                </span>
              </div>
              <div className="booksGrid">
                {librosSubidos.map((book) => (
                  <article
                    key={book.id}
                    className="bookCard"
                    onClick={() => navigate("/detalle-libro", { state: { libroId: book.id } })}
                    style={{ cursor: "pointer" }}
                  >
                    <img
                      src={getCoverImage(book)}
                      alt={book.title}
                      className="bookCardImage"
                    />
                    <div className="bookCardBody">
                      <h3 className="bookCardTitle">{book.title}</h3>
                      <p className="bookCardAuthor">{book.author}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

          </>
        )}
      </div>
    </section>
  );
}
