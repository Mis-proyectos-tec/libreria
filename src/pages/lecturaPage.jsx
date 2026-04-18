import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppData } from "../context/appDataContext.jsx";

export default function LecturaPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { books, loading, error } = useAppData();

  const libroId = location.state?.libroId || 1;

  const book = useMemo(() => {
    return books.find((item) => item.id === libroId);
  }, [books, libroId]);

  if (loading) return <p>Cargando lectura...</p>;
  if (error) return <p>{error}</p>;
  if (!book) return <p>Libro no encontrado.</p>;
  if (!book.pdfUrl) return <p>Este libro no tiene PDF disponible.</p>;

  return (
    <section className="lecturaPage">
      <div className="readingWrapper">
        <header className="readingHeader">
          <div className="readingHeaderLeft">
            <button
              className="backButton"
              onClick={() =>
                navigate("/detalle-libro", { state: { libroId: book.id } })
              }
            >
              ← Volver al detalle
            </button>

            <div>
              <p className="readingLabel">Modo lectura</p>
              <h1 className="readingTitle">{book.title}</h1>
              <p className="readingAuthor">{book.author}</p>
            </div>
          </div>
        </header>

        <div className="readingPdfContainer">
          <iframe
            src={book.pdfUrl}
            title={book.title}
            width="100%"
            height="100%"
            style={{ border: "none" }}
          />
        </div>
      </div>
    </section>
  );
}