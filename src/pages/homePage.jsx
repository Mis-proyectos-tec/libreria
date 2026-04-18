import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import BookCard from "../components/bookCard.jsx";
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

    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
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

  function getFavoriteKey() {
    return `favorites-${currentUser?.id}`;
  }

  function getFavorites() {
    const saved = localStorage.getItem(getFavoriteKey());
    return saved ? JSON.parse(saved) : [];
  }

  const favoriteIds = getFavorites();

  const favoriteBooks = useMemo(() => {
    return userBooks.filter((book) => favoriteIds.includes(book.id));
  }, [userBooks]);

  if (!currentUser) return <p>Debes iniciar sesión.</p>;
  if (loading) return <p>Cargando inicio...</p>;
  if (error) return <p>{error}</p>;

  return (
    <section className="homePage">
      <section className="heroSection">
        <div className="heroContent">
          <span className="heroBadge">Biblioteca digital</span>
          <h1 className="heroTitle">Bienvenido, {currentUser.name}</h1>
          <p className="heroText">
            Continúa tus lecturas, revisa tu biblioteca y gestiona tus favoritos.
          </p>
        </div>
      </section>

      <section className="sectionBlock">
        <div className="sectionHeader">
          <h2>Continuar leyendo</h2>
        </div>

        {continueReadingBooks.length === 0 ? (
          <p>No tienes lecturas guardadas.</p>
        ) : (
          <div className="booksGrid">
            {continueReadingBooks.map((book) => (
              <div
                key={book.id}
                onClick={() =>
                  navigate("/lectura", { state: { libroId: book.id } })
                }
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
          <h2>Biblioteca</h2>
        </div>

        {userBooks.length === 0 ? (
          <p>No tienes libros en tu biblioteca.</p>
        ) : (
          <div className="booksGrid">
            {userBooks.map((book) => (
              <div
                key={book.id}
                onClick={() =>
                  navigate("/detalle-libro", { state: { libroId: book.id } })
                }
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

      <section className="sectionBlock">
        <div className="sectionHeader">
          <h2>Favoritos</h2>
        </div>

        {favoriteBooks.length === 0 ? (
          <p>No tienes favoritos.</p>
        ) : (
          <div className="booksGrid">
            {favoriteBooks.map((book) => (
              <div
                key={book.id}
                onClick={() =>
                  navigate("/detalle-libro", { state: { libroId: book.id } })
                }
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