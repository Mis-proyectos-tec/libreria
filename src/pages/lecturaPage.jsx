import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { useAppData } from "../context/appDataContext.jsx";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function LecturaPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { books, readingProgress, loading, error } = useAppData();

  const libroId = location.state?.libroId || 1;

  const book = useMemo(() => {
    return books.find((item) => item.id === libroId);
  }, [books, libroId]);

  const progresoLibro = useMemo(() => {
    return readingProgress.find((item) => item.bookId === libroId) || null;
  }, [readingProgress, libroId]);

  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(progresoLibro?.currentPage || 1);
  const [scale, setScale] = useState(1.2);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);

    if (pageNumber > numPages) {
      setPageNumber(1);
    }
  }

  function irPaginaAnterior() {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  }

  function irPaginaSiguiente() {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  }

  const progreso = numPages ? (pageNumber / numPages) * 100 : 0;

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

          <div className="readingTools">
            <button
              className="toolButton"
              onClick={() => setScale((prev) => Math.max(prev - 0.1, 0.8))}
            >
              Zoom -
            </button>
            <button
              className="toolButton"
              onClick={() => setScale((prev) => Math.min(prev + 0.1, 2))}
            >
              Zoom +
            </button>
          </div>
        </header>

        <div className="readingProgressSection">
          <div className="readingProgressBar">
            <div
              className="readingProgressFill"
              style={{ width: `${progreso}%` }}
            />
          </div>

          <p className="readingProgressText">
            Página {pageNumber} de {numPages || "..."} • {Math.round(progreso)}%
            completado
          </p>
        </div>

        <div className="readingPdfContainer">
          <Document
            file={book.pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<p>Cargando PDF...</p>}
            error={<p>No se pudo cargar el PDF.</p>}
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          </Document>
        </div>

        <div className="readingFooter">
          <button
            className="secondaryButton"
            onClick={irPaginaAnterior}
            disabled={pageNumber <= 1}
          >
            ← Página anterior
          </button>

          <span className="readingPageIndicator">
            {pageNumber} / {numPages || "..."}
          </span>

          <button
            className="primaryButton"
            onClick={irPaginaSiguiente}
            disabled={!numPages || pageNumber >= numPages}
          >
            Página siguiente →
          </button>
        </div>
      </div>
    </section>
  );
}