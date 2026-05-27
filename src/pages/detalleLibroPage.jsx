import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppData } from "../context/appDataContext.jsx";
import { useAuth } from "../context/authContext.jsx";
import { updateBook, createFavorite, deleteFavorite } from "../services/booksService.js";

export default function DetalleLibroPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { books, loading, error, reloadAppData, favorites } = useAppData();

  const libroId = location.state?.libroId;

  const book = useMemo(() => {
    return books.find((item) => String(item.id) === String(libroId)) || null;
  }, [books, libroId]);

  const favoritoActual = useMemo(() => {
    if (!book || !currentUser) return null;
    return favorites.find(
      (f) =>
        String(f.userId) === String(currentUser.id) &&
        String(f.bookId) === String(book.id)
    ) || null;
  }, [favorites, book, currentUser]);

  const esFavorito = Boolean(favoritoActual);

  const [isEditing, setIsEditing] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const [formData, setFormData] = useState({
    title: book?.title || "",
    author: book?.author || "",
    category: book?.category || "",
    description: book?.description || "",
    language: book?.language || "",
    totalPages: book?.totalPages || "",
    currentStatus: book?.currentStatus || "",
    coverUrl: book?.coverUrl || "",
    pdfUrl: book?.pdfUrl || "",
  });

  async function toggleFavorito() {
    if (!book) return;
    try {
      if (esFavorito) {
        await deleteFavorite(favoritoActual.id);
      } else {
        await createFavorite({ userId: currentUser.id, bookId: book.id });
      }
      await reloadAppData();
    } catch (err) {
      console.error(err);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSaveBook() {
    if (!book) return;

    try {
      const payload = {
        ...book,
        ...formData,
        totalPages: Number(formData.totalPages) || 0,
      };

      await updateBook(book.id, payload);

      setSaveMessage("Libro actualizado correctamente.");
      setIsEditing(false);

      if (reloadAppData) {
        await reloadAppData();
      }
    } catch (err) {
      console.error(err);
      setSaveMessage("No se pudo actualizar el libro en el API.");
    }
  }

  function handleCancelEdit() {
    setFormData({
      title: book?.title || "",
      author: book?.author || "",
      category: book?.category || "",
      description: book?.description || "",
      language: book?.language || "",
      totalPages: book?.totalPages || "",
      currentStatus: book?.currentStatus || "",
      coverUrl: book?.coverUrl || "",
      pdfUrl: book?.pdfUrl || "",
    });

    setIsEditing(false);
    setSaveMessage("");
  }

  if (loading) return <p>Cargando libro...</p>;
  if (error) return <p>{error}</p>;
  if (!libroId) return <p>No se recibió el libro seleccionado.</p>;
  if (!book) return <p>Libro no encontrado.</p>;

  return (
    <section className="detalleLibroPage">
      <div className="detalleLibroCard">
        <img
          src={formData.coverUrl || "/assets/defaultBook.png"}
          alt={formData.title}
          className="detalleLibroImage"
        />

        <div className="detalleLibroContent">
          <span className="heroBadge">{formData.category || "Sin categoría"}</span>

          {isEditing ? (
            <div className="perfilGrid">
              <div className="perfilField">
                <label>Título</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                />
              </div>

              <div className="perfilField">
                <label>Autor</label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                />
              </div>

              <div className="perfilField">
                <label>Categoría</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                />
              </div>

              <div className="perfilField">
                <label>Idioma</label>
                <input
                  type="text"
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                />
              </div>

              <div className="perfilField">
                <label>Páginas</label>
                <input
                  type="number"
                  name="totalPages"
                  value={formData.totalPages}
                  onChange={handleChange}
                />
              </div>

              <div className="perfilField">
                <label>Estado</label>
                <input
                  type="text"
                  name="currentStatus"
                  value={formData.currentStatus}
                  onChange={handleChange}
                />
              </div>

              <div className="perfilField">
                <label>Portada URL</label>
                <input
                  type="text"
                  name="coverUrl"
                  value={formData.coverUrl}
                  onChange={handleChange}
                />
              </div>

              <div className="perfilField">
                <label>PDF URL</label>
                <input
                  type="text"
                  name="pdfUrl"
                  value={formData.pdfUrl}
                  onChange={handleChange}
                />
              </div>

              <div className="perfilField" style={{ gridColumn: "1 / -1" }}>
                <label>Descripción</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                />
              </div>
            </div>
          ) : (
            <>
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
                  <span>{book.currentStatus || "Activo"}</span>
                </div>
              </div>
            </>
          )}

          {saveMessage && <p className="saveMessage">{saveMessage}</p>}

          <div className="detalleActions">
            <button
              className="secondaryButton"
              onClick={() => navigate("/biblioteca")}
            >
              Volver
            </button>

            <button
              className="primaryButton"
              onClick={() =>
                navigate("/lectura", { state: { libroId: book.id } })
              }
            >
              Seguir leyendo
            </button>

            <button className="secondaryButton" onClick={toggleFavorito}>
              {esFavorito ? "★ Quitar favorito" : "☆ Agregar a favoritos"}
            </button>

            {!isEditing ? (
              <button
                className="secondaryButton"
                onClick={() => {
                  setIsEditing(true);
                  setSaveMessage("");
                }}
              >
                Editar libro
              </button>
            ) : (
              <>
                <button className="primaryButton" onClick={handleSaveBook}>
                  Guardar cambios
                </button>

                <button className="secondaryButton" onClick={handleCancelEdit}>
                  Cancelar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
