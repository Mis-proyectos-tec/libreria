import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppData } from "../context/appDataContext.jsx";
import EmptyState from "../components/EmptyState.jsx";

export default function PerfilUsuarioPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { books, users, readingProgress, loading, error } = useAppData();

  const usuarioId = location.state?.usuarioId;

  const usuario = useMemo(() => {
    return users.find((u) => String(u.id) === String(usuarioId)) || null;
  }, [users, usuarioId]);

  const librosSubidos = useMemo(() => {
    if (!usuario) return [];
    return books.filter((b) => String(b.userId) === String(usuario.id));
  }, [books, usuario]);

  const librosEnProces = useMemo(() => {
    if (!usuario) return [];
    return readingProgress.filter((p) => String(p.userId) === String(usuario.id) && p.percentage > 0 && p.percentage < 100);
  }, [readingProgress, usuario]);

  const librosDeterminados = useMemo(() => {
    if (!usuario) return [];
    return readingProgress.filter((p) => String(p.userId) === String(usuario.id) && p.percentage === 100);
  }, [readingProgress, usuario]);

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
            <p className="perfilUsuarioEmail">{usuario.email}</p>
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
          <div className="statBox">
            <p className="statNumber">{librosEnProces.length}</p>
            <p className="statLabel">En proceso</p>
          </div>
          <div className="statBox">
            <p className="statNumber">{librosDeterminados.length}</p>
            <p className="statLabel">Terminados</p>
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
                      src={book.coverUrl || "/assets/defaultBook.png"}
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

            {librosEnProces.length > 0 && (
              <div className="sectionBlock">
                <div className="sectionHeader">
                  <h2>En proceso de lectura</h2>
                  <span style={{ color: "var(--muted)", fontSize: "0.88rem" }}>
                    {librosEnProces.length} {librosEnProces.length === 1 ? "libro" : "libros"}
                  </span>
                </div>
                <div className="booksGrid">
                  {librosEnProces.map((progress) => {
                    const book = books.find((b) => String(b.id) === String(progress.bookId));
                    if (!book) return null;
                    return (
                      <article
                        key={book.id}
                        className="bookCard"
                        onClick={() => navigate("/detalle-libro", { state: { libroId: book.id } })}
                        style={{ cursor: "pointer" }}
                      >
                        <img
                          src={book.coverUrl || "/assets/defaultBook.png"}
                          alt={book.title}
                          className="bookCardImage"
                        />
                        <div className="bookCardBody">
                          <h3 className="bookCardTitle">{book.title}</h3>
                          <p className="bookCardAuthor">{book.author}</p>
                          <p style={{ fontSize: "0.76rem", color: "var(--muted)", margin: "4px 0 0" }}>
                            {progress.percentage}% completado
                          </p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}

            {librosDeterminados.length > 0 && (
              <div className="sectionBlock">
                <div className="sectionHeader">
                  <h2>Libros terminados</h2>
                  <span style={{ color: "var(--muted)", fontSize: "0.88rem" }}>
                    {librosDeterminados.length} {librosDeterminados.length === 1 ? "libro" : "libros"}
                  </span>
                </div>
                <div className="booksGrid">
                  {librosDeterminados.map((progress) => {
                    const book = books.find((b) => String(b.id) === String(progress.bookId));
                    if (!book) return null;
                    return (
                      <article
                        key={book.id}
                        className="bookCard"
                        onClick={() => navigate("/detalle-libro", { state: { libroId: book.id } })}
                        style={{ cursor: "pointer" }}
                      >
                        <img
                          src={book.coverUrl || "/assets/defaultBook.png"}
                          alt={book.title}
                          className="bookCardImage"
                        />
                        <div className="bookCardBody">
                          <h3 className="bookCardTitle">{book.title}</h3>
                          <p className="bookCardAuthor">{book.author}</p>
                          <p style={{ fontSize: "0.76rem", color: "var(--success)", margin: "4px 0 0" }}>
                            ✓ Completado
                          </p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
