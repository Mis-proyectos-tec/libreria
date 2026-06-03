import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import BookCard from "../components/bookCard.jsx";
import StatCard from "../components/StatCard.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { useAuth } from "../context/authContext.jsx";
import { useAppData } from "../context/appDataContext.jsx";

export default function HomePage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { books, loading, error } = useAppData();

  function getProgressKey(bookId) {
    return `reading-progress-${currentUser?.id}-${bookId}`;
  }

  function getLocalProgress(bookId) {
    const saved = localStorage.getItem(getProgressKey(bookId));
    if (!saved) return null;
    try { return JSON.parse(saved); } catch { return null; }
  }

  const userBooks = useMemo(() => {
    if (!currentUser) return [];
    return books.filter((book) => String(book.userId) === String(currentUser.id));
  }, [books, currentUser]);

  const continueReadingBooks = useMemo(() => {
    return userBooks
      .map((book) => {
        const progress = getLocalProgress(book.id);
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
  }, [userBooks]);

  function getFavoriteKey() { return `favorites-${currentUser?.id}`; }

  function getFavorites() {
    const saved = localStorage.getItem(getFavoriteKey());
    return saved ? JSON.parse(saved) : [];
  }

  const favoriteIds = getFavorites();

  const favoriteBooks = useMemo(() => {
    return userBooks.filter((book) => favoriteIds.includes(book.id));
  }, [userBooks]);

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
        <StatCard icon="♡" value={favoriteBooks.length} label="Favoritos" />
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
                  portada={book.coverUrl || "/assets/defaultBook.png"}
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
          <h2>Favoritos</h2>
          {favoriteBooks.length > 0 && (
            <button className="secondaryButton" onClick={() => navigate("/favoritos")}>
              Ver todo
            </button>
          )}
        </div>

        {favoriteBooks.length === 0 ? (
          <EmptyState
            icon="♡"
            title="Sin favoritos"
            text="Marca libros como favoritos desde su detalle."
          />
        ) : (
          <div className="booksGrid">
            {favoriteBooks.map((book) => (
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

    </section>
  );
}
