import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppData } from "../context/appDataContext.jsx";

export default function DetalleLibroPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { books, loading, error } = useAppData();

  const libroId = location.state?.libroId || 1;

  const book = useMemo(() => {
    return books.find((item) => item.id === libroId);
  }, [books, libroId]);

  if (loading) return <p>Cargando libro...</p>;
  if (error) return <p>{error}</p>;
  if (!book) return <p>Libro no encontrado.</p>;

  return (
    <section className="detalleLibroPage">
      <div className="detalleLibroCard">
        <img
          src={book.coverUrl || "/assets/defaultBook.png"}
          alt={book.title}
          className="detalleLibroImage"
        />

        <div className="detalleLibroContent">
          <span className="heroBadge">{book.category}</span>
          <h1>{book.title}</h1>
          <p className="detalleAutor">{book.author}</p>
          <p className="detalleDescripcion">{book.description}</p>

          <div className="detalleMeta">
            <div className="metaItem">
              <strong>Idioma</strong>
              <span>{book.language || "N/A"}</span>
            </div>

            <div className="metaItem">
              <strong>Páginas</strong>
              <span>{book.totalPages || "N/A"}</span>
            </div>

            <div className="metaItem">
              <strong>Estado</strong>
              <span>{book.currentStatus || "activo"}</span>
            </div>
          </div>

          <div className="detalleActions">
            <button
              className="secondaryButton"
              onClick={() => navigate("/biblioteca")}
            >
              Volver a biblioteca
            </button>

            <button
              className="primaryButton"
              onClick={() =>
                navigate("/lectura", { state: { libroId: book.id } })
              }
            >
              Seguir leyendo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}