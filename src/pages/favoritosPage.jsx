import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext.jsx";
import { useAppData } from "../context/appDataContext.jsx";
import { deleteFavorite } from "../services/booksService.js";
import BookCard from "../components/bookCard.jsx";
import EmptyState from "../components/EmptyState.jsx";

export default function FavoritosPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { books, favorites, loading, error, reloadAppData } = useAppData();

  const misRegistrosFavoritos = useMemo(() => {
    return favorites.filter((f) => String(f.userId) === String(currentUser?.id));
  }, [favorites, currentUser?.id]);

  const favoritos = useMemo(() => {
    return books.filter((book) =>
      misRegistrosFavoritos.some((f) => String(f.bookId) === String(book.id))
    );
  }, [books, misRegistrosFavoritos]);

  async function quitarFavorito(bookId) {
    const registro = misRegistrosFavoritos.find(
      (f) => String(f.bookId) === String(bookId)
    );
    if (!registro) return;
    try {
      await deleteFavorite(registro.id);
      await reloadAppData();
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <p style={{ color: "var(--muted)" }}>Cargando favoritos...</p>;
  if (error) return <p className="unsavedWarning">{error}</p>;

  return (
    <section className="sectionBlock">
      <div className="sectionHeader">
        <h1>Favoritos</h1>
      </div>

      {favoritos.length === 0 ? (
        <EmptyState
          icon="♡"
          title="Sin favoritos"
          text="Marca libros como favoritos desde la página de detalle del libro."
          action={
            <button className="secondaryButton" onClick={() => navigate("/biblioteca")}>
              Ver mi biblioteca
            </button>
          }
        />
      ) : (
        <div className="booksGrid">
          {favoritos.map((book) => (
            <div key={book.id} className="favoriteCardWrapper">
              <div
                onClick={() => navigate("/detalle-libro", { state: { libroId: book.id } })}
                style={{ cursor: "pointer" }}
              >
                <BookCard
                  titulo={book.title}
                  autor={book.author}
                  portada={book.coverUrl || "/assets/defaultBook.png"}
                />
              </div>
              <button className="dangerButton" onClick={() => quitarFavorito(book.id)}>
                Quitar de favoritos
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
