import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useAuth } from "../context/authContext.jsx";
import { useAppData } from "../context/appDataContext.jsx";
import { createReadingProgress, updateReadingProgress } from "../services/booksService.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function LecturaPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { books, loading, error, readingProgress, reloadAppData } = useAppData();

  const libroId = location.state?.libroId || 1;

  const book = useMemo(() => {
    return books.find((item) => item.id === libroId);
  }, [books, libroId]);

  const progresoExistente = useMemo(() => {
    return readingProgress.find(
      (p) =>
        String(p.userId) === String(currentUser?.id) &&
        String(p.bookId) === String(libroId)
    ) || null;
  }, [readingProgress, currentUser?.id, libroId]);

  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(progresoExistente?.currentPage || 1);
  const [savedPage, setSavedPage] = useState(progresoExistente?.currentPage || 1);
  const [scale, setScale] = useState(1.15);
  const [darkMode, setDarkMode] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    if (progresoExistente?.currentPage) {
      setPageNumber(progresoExistente.currentPage);
      setSavedPage(progresoExistente.currentPage);
    }
  }, [progresoExistente?.currentPage]);

  const hasUnsavedChanges = pageNumber !== savedPage;

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!hasUnsavedChanges) return;
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);

    if (pageNumber > numPages) {
      setPageNumber(1);
      setSavedPage(1);
    }
  }

  function irPaginaAnterior() {
    setPageNumber((prev) => Math.max(prev - 1, 1));
    setSaveMessage("");
  }

  function irPaginaSiguiente() {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
    setSaveMessage("");
  }

  async function guardarProgreso() {
    if (!currentUser) return;
    const percentage = numPages ? Math.round((pageNumber / numPages) * 100) : 0;
    const data = {
      userId: currentUser.id,
      bookId: libroId,
      currentPage: pageNumber,
      percentage,
    };

    try {
      if (progresoExistente) {
        await updateReadingProgress(progresoExistente.id, data);
      } else {
        await createReadingProgress(data);
      }
      setSavedPage(pageNumber);
      setSaveMessage(`Progreso guardado en la página ${pageNumber}.`);
      await reloadAppData();
    } catch {
      setSaveMessage("Error al guardar el progreso.");
    }
  }

  function handleVolver() {
    if (hasUnsavedChanges) {
      const confirmarSalida = window.confirm(
        "Tienes cambios sin guardar. Si sales ahora, perderás el progreso no guardado. ¿Deseas salir?"
      );

      if (!confirmarSalida) return;
    }

    navigate("/detalle-libro", { state: { libroId: book.id } });
  }

  const progreso = numPages ? (pageNumber / numPages) * 100 : 0;

  if (loading) return <p>Cargando lectura...</p>;
  if (error) return <p>{error}</p>;
  if (!book) return <p>Libro no encontrado.</p>;
  if (!book.pdfUrl) return <p>Este libro no tiene PDF disponible.</p>;

  return (
    <section className={`lecturaPage ${darkMode ? "lecturaPageDark" : ""}`}>
      <div className="readingWrapper">
        <header className="readingHeader">
          <div className="readingHeaderLeft">
            <button className="backButton" onClick={handleVolver}>
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

            <button
              className="toolButton"
              onClick={() => setDarkMode((prev) => !prev)}
            >
              {darkMode ? "☀ Claro" : "🌙 Oscuro"}
            </button>

            <button className="primaryButton" onClick={guardarProgreso}>
              Guardar progreso
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

          {hasUnsavedChanges && (
            <p className="unsavedWarning">Tienes cambios sin guardar.</p>
          )}

          {saveMessage && <p className="saveMessage">{saveMessage}</p>}
        </div>

        <div className={`readingPdfContainer ${darkMode ? "pdfDarkMode" : ""}`}>
          <Document
            file={`${API_BASE_URL}/books/${book.id}/pdf`}
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
