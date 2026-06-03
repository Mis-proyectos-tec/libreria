import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BookCard from "../components/bookCard.jsx";
import StatCard from "../components/StatCard.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { useAuth } from "../context/authContext.jsx";
import { useAppData } from "../context/appDataContext.jsx";
import { getBookCoverUrl } from "../services/booksService.js";

export default function HomePage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { books, favorites, readingProgress, loading, error } = useAppData();
  const [coverUrls, setCoverUrls] = useState({});

  const userBooks = useMemo(() => {
    if (!currentUser) return [];
    return books.filter((book) => String(book.userId) === String(currentUser.id));
  }, [books, currentUser]);

  const misBibliotecaLibros = useMemo(() => {
    if (!currentUser) return [];
    // Mis libros + libros guardados de otros
    const misPropios = books.filter((book) => String(book.userId) === String(currentUser.id));
    const guardados = books.filter((book) =>
      favorites.some((f) => String(f.bookId) === String(book.id) && String(f.userId) === String(currentUser.id)) &&
      String(book.userId) !== String(currentUser.id)
    );
    return [...misPropios, ...guardados];
  }, [books, favorites, currentUser]);

  const continueReadingBooks = useMemo(() => {
    if (!currentUser || !readingProgress) return [];
    return books
      .map((book) => {
        const progress = readingProgress.find(
          (p) => String(p.userId) === String(currentUser.id) && String(p.bookId) === String(book.id)
        );
        if (!progress) return null;
        return {
          ...book,
          currentPage: progress.currentPage || 1,
          percentage: progress.percentage || 0,
          updatedAt: progress.updatedAt || "",
        };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [books, readingProgress, currentUser]);

  async function loadCoverUrls() {
    const allBooks = [...continueReadingBooks, ...misBibliotecaLibros];
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
    if (continueReadingBooks.length > 0 || misBibliotecaLibros.length > 0) {
      loadCoverUrls();
    }
  }, [continueReadingBooks, misBibliotecaLibros]);

  function getCoverImage(book) {
    return coverUrls[book.id] || book.coverUrl || "/assets/defaultBook.png";
  }

  function getFavoriteKey() { return `favorites-${currentUser?.id}`; }

  function getFavorites() {
    const saved = localStorage.getItem(getFavoriteKey());
    return saved ? JSON.parse(saved) : [];
  }

  const misRegistrosFavoritos = useMemo(() => {
    if (!currentUser) return [];
    // Solo los favoritos que son libros de OTROS (no mis propios libros)
    return books
      .filter((book) =>
        favorites.some((f) => String(f.bookId) === String(book.id) && String(f.userId) === String(currentUser.id))
      )
      .filter((book) => String(book.userId) !== String(currentUser.id));
  }, [books, favorites, currentUser]);

  if (!currentUser) return <p>Debes iniciar sesión.</p>;
  if (loading) return <p style={{ color: "var(--muted)" }}>Cargando...</p>;
  if (error) return <p className="unsavedWarning">{error}</p>;

  const hora = new Date().getHours();
  const saludo = hora < 12 ? "Buenos días" : hora < 19 ? "Buenas tardes" : "Buenas noches";

  return (
    <section className="homePage">

      <section className="heroSection">
        <div className="heroContent">
          <span className="heroBadge">Biblio-TEC</span>
          <h1 className="heroTitle">{saludo}, {currentUser.name}</h1>
          <p className="heroText">
            Continúa tus lecturas, explora tu biblioteca y gestiona tus favoritos.
          </p>
          <div className="heroButtons">
            <button className="primaryButton" onClick={() => navigate("/biblioteca")}>
              Mi biblioteca
            </button>
            <button className="secondaryButton" onClick={() => navigate("/explorar-libros")}>
              Explorar
            </button>
          </div>
        </div>
      </section>

      <div className="statCardsRow">
        <StatCard icon="📚" value={userBooks.length} label="Libros" />
        <StatCard icon="📖" value={continueReadingBooks.length} label="Leyendo" />
        <StatCard icon="♡" value={misRegistrosFavoritos.length} label="Guardados" />
      </div>

      <section className="sectionBlock">
        <div className="sectionHeader">
          <h2>Continuar leyendo</h2>
          {continueReadingBooks.length > 0 && (
            <button className="secondaryButton" onClick={() => navigate("/biblioteca")}>
              Ver todo
            </button>
          )}
        </div>

        {continueReadingBooks.length === 0 ? (
          <EmptyState
            icon="📖"
            title="Sin lecturas activas"
            text="Abre un libro para empezar a leer y aparecerá aquí."
            action={
              <button className="primaryButton" onClick={() => navigate("/biblioteca")}>
                Ir a mi biblioteca
              </button>
            }
          />
        ) : (
          <div className="booksGrid">
            {continueReadingBooks.map((book) => (
              <div
                key={book.id}
                onClick={() => navigate("/lectura", { state: { libroId: book.id } })}
                style={{ cursor: "pointer" }}
              >
                <BookCard
                  titulo={book.title}
                  autor={book.author}
                  portada={getCoverImage(book)}
                  progreso={book.percentage}
                  mostrarProgreso={true}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="sectionBlock">
        <div className="sectionHeader">
          <h2>Mi biblioteca</h2>
          <span style={{ color: "var(--muted)", fontSize: "0.88rem" }}>
            {misBibliotecaLibros.length} {misBibliotecaLibros.length === 1 ? "libro" : "libros"}
          </span>
          {misBibliotecaLibros.length > 0 && (
            <button className="secondaryButton" onClick={() => navigate("/biblioteca")}>
              Ver todo
            </button>
          )}
        </div>

        {misBibliotecaLibros.length === 0 ? (
          <EmptyState
            icon="📚"
            title="Biblioteca vacía"
            text="Sube tus primeros libros o explora y guarda los de otros usuarios."
            action={
              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                <button className="primaryButton" onClick={() => navigate("/nuevo-libro")}>
                  Subir libro
                </button>
                <button className="secondaryButton" onClick={() => navigate("/explorar-libros")}>
                  Explorar
                </button>
              </div>
            }
          />
        ) : (
          <div className="booksGrid">
            {misBibliotecaLibros.slice(0, 6).map((book) => (
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
        )}
      </section>

    </section>
  );
}
