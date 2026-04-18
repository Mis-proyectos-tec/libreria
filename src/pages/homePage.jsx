import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import BookCard from "../components/bookCard.jsx";
import { useAuth } from "../context/authContext.jsx";
import { useAppData } from "../context/appDataContext.jsx";

export default function HomePage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { books, favorites, readingProgress, loading, error } = useAppData();

  const userBooks = useMemo(() => {
    if (!currentUser) return [];
    return books.filter((book) => book.userId === currentUser.id);
  }, [books, currentUser]);

  const continueReadingBooks = useMemo(() => {
    if (!currentUser) return [];

    return readingProgress
      .filter((item) => item.userId === currentUser.id)
      .map((progressItem) => {
        const book = books.find((item) => item.id === progressItem.bookId);
        if (!book) return null;

        return {
          ...book,
          progress: progressItem.percentage || 0,
          currentPage: progressItem.currentPage || 1,
        };
      })
      .filter(Boolean);
  }, [readingProgress, books, currentUser]);

  const favoriteBooks = useMemo(() => {
    if (!currentUser) return [];

    const favoriteIds = favorites
      .filter((fav) => fav.userId === currentUser.id)
      .map((fav) => fav.bookId);

    return books.filter((book) => favoriteIds.includes(book.id));
  }, [books, favorites, currentUser]);

  const recentBooks = useMemo(() => {
    return userBooks.slice(0, 8);
  }, [userBooks]);

  if (!currentUser) return <p>Debes iniciar sesión.</p>;
  if (loading) return <p>Cargando inicio...</p>;
  if (error) return <p>{error}</p>;

  return (
    <section className="homePage">
      <section className="heroSection">
        <div className="heroContent">
          <span className="heroBadge">Biblioteca digital</span>
          <h1 className="heroTitle">
            Organiza tus libros y continúa leyendo fácilmente
          </h1>
          <p className="heroText">
            Administra tu biblioteca, consulta tus favoritos y retoma tus lecturas
            desde un solo lugar.
          </p>

          <div className="heroButtons">
            <button
              className="primaryButton"
              onClick={() => navigate("/biblioteca")}
            >
              Ver biblioteca
            </button>

            <button
              className="secondaryButton"
              onClick={() => navigate("/mi-biblioteca")}
            >
              Ver favoritos
            </button>
          </div>
        </div>
      </section>

      <section className="sectionBlock">
        <div className="sectionHeader">
          <h2>Continuar leyendo</h2>
        </div>

        {continueReadingBooks.length === 0 ? (
          <p>No tienes lecturas en progreso.</p>
        ) : (
          <div className="booksGrid">
            {continueReadingBooks.map((book) => (
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
                  progreso={book.progress}
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

        {recentBooks.length === 0 ? (
          <p>No tienes libros en tu biblioteca.</p>
        ) : (
          <div className="booksGrid">
            {recentBooks.map((book) => (
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
          <p>No tienes libros en favoritos.</p>
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