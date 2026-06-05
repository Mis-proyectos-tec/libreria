import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppData } from "../context/appDataContext.jsx";
import { useAuth } from "../context/authContext.jsx";
import {
  updateBook,
  createFavorite,
  deleteFavorite,
  deleteBook,
  getBookCoverUrl,
} from "../services/booksService.js";
import {
  getBookLikeStatus,
  toggleBookLike,
} from "../services/notificationsService.js";

export default function DetalleLibroPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { currentUser } = useAuth();

  const {
    books = [],
    users = [],
    loading,
    error,
    reloadAppData,
    favorites = [],
    readingProgress = [],
  } = useAppData();

  const libroId = location.state?.libroId;

  const book = useMemo(() => {
    return books.find((item) => String(item.id) === String(libroId)) || null;
  }, [books, libroId]);

  const currentUserId =
    currentUser?.id ||
    currentUser?.userId ||
    currentUser?.user_id ||
    currentUser?.uid ||
    currentUser?.firebaseUid ||
    currentUser?.firebaseUuid ||
    null;

  const bookOwnerId =
    book?.user_id ||
    book?.userId ||
    book?.uploaded_by ||
    book?.uploadedBy ||
    null;

  const esDuenoDelLibro =
    currentUserId && bookOwnerId && String(currentUserId) === String(bookOwnerId);

  const favoritoActual = useMemo(() => {
    if (!book || !currentUserId) return null;

    return (
      favorites.find(
        (favorite) =>
          String(favorite.userId || favorite.user_id) === String(currentUserId) &&
          String(favorite.bookId || favorite.book_id) === String(book.id)
      ) || null
    );
  }, [favorites, book, currentUserId]);

  const esFavorito = Boolean(favoritoActual);

  const tieneProgreso = useMemo(() => {
    if (!currentUserId || !book) return false;

    return (
      readingProgress?.some(
        (progress) =>
          String(progress.userId || progress.user_id) === String(currentUserId) &&
          String(progress.bookId || progress.book_id) === String(book.id)
      ) || false
    );
  }, [readingProgress, currentUserId, book]);

  const uploadedByName = useMemo(() => {
    if (!book) return "Usuario desconocido";

    if (book.uploader_name) {
      return book.uploader_name;
    }

    const userId = book.userId || book.user_id;

    if (!userId) return "Usuario desconocido";

    const user = users.find((item) => String(item.id) === String(userId));

    if (!user) return `Usuario ${userId}`;

    return (
      user.name ||
      user.fullName ||
      user.username ||
      user.email ||
      `Usuario ${userId}`
    );
  }, [book, users]);

  const [isEditing, setIsEditing] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [coverUrl, setCoverUrl] = useState("");

  const [likeLoading, setLikeLoading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "",
    description: "",
    language: "",
    totalPages: "",
    currentStatus: "",
    coverUrl: "",
    pdfUrl: "",
  });

  useEffect(() => {
    if (!book) return;

    setFormData({
      title: book.title || "",
      author: book.author || "",
      category: book.category || "",
      description: book.description || "",
      language: book.language || "es",
      totalPages: book.totalPages || book.total_pages || "",
      currentStatus: book.currentStatus || book.current_status || "activo",
      coverUrl: book.coverUrl || "",
      pdfUrl: book.pdfUrl || "",
    });
  }, [book]);

  useEffect(() => {
    async function loadCover() {
      if (!book?.id) return;

      const hasCover = book.cover_blob_name || book.coverBlobName;

      if (!hasCover) {
        setCoverUrl("");
        return;
      }

      try {
        const response = await getBookCoverUrl(book.id);
        setCoverUrl(response.coverUrl || "");
      } catch {
        setCoverUrl("");
      }
    }

    loadCover();
  }, [book?.id, book?.cover_blob_name, book?.coverBlobName]);

  useEffect(() => {
    async function loadLikeStatus() {
      if (!book?.id || !currentUser || esDuenoDelLibro) {
        setLiked(false);
        setLikesCount(0);
        return;
      }

      try {
        const data = await getBookLikeStatus(book.id, currentUser);
        setLiked(Boolean(data.liked));
        setLikesCount(data.likesCount || 0);
      } catch {
        setLiked(false);
        setLikesCount(0);
      }
    }

    loadLikeStatus();
  }, [book?.id, currentUserId, esDuenoDelLibro, currentUser]);

  async function toggleFavorito() {
    if (!book || !currentUserId) return;

    try {
      if (esFavorito) {
        await deleteFavorite(favoritoActual.id);
      } else {
        await createFavorite({
          userId: currentUserId,
          bookId: book.id,
        });
      }

      if (reloadAppData) {
        await reloadAppData();
      }
    } catch {
      alert("No se pudo actualizar tu biblioteca.");
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

    if (!esDuenoDelLibro) {
      setSaveMessage("No tienes permiso para editar este libro.");
      return;
    }

    try {
      const payload = {
        title: formData.title,
        author: formData.author,
        category: formData.category,
        description: formData.description,
        language: formData.language,
        currentStatus: formData.currentStatus,
      };

      await updateBook(book.id, payload);

      setSaveMessage("Libro actualizado correctamente.");
      setIsEditing(false);

      if (reloadAppData) {
        await reloadAppData();
      }
    } catch {
      setSaveMessage("No se pudo actualizar el libro.");
    }
  }

  function handleCancelEdit() {
    setFormData({
      title: book?.title || "",
      author: book?.author || "",
      category: book?.category || "",
      description: book?.description || "",
      language: book?.language || "es",
      totalPages: book?.totalPages || book?.total_pages || "",
      currentStatus: book?.currentStatus || book?.current_status || "activo",
      coverUrl: book?.coverUrl || "",
      pdfUrl: book?.pdfUrl || "",
    });

    setIsEditing(false);
    setSaveMessage("");
  }

  async function handleDeleteBook() {
    if (!book) return;

    if (!esDuenoDelLibro) {
      alert("No tienes permiso para eliminar este libro.");
      return;
    }

    const confirmar = window.confirm(
      `¿Seguro que deseas eliminar "${book.title}"? Esta acción no se puede deshacer.`
    );

    if (!confirmar) return;

    try {
      await deleteBook(book.id);

      if (reloadAppData) {
        await reloadAppData();
      }

      navigate("/explorar-libros");
    } catch {
      alert("No se pudo eliminar el libro.");
    }
  }

  async function handleLikeBook() {
    if (!book || !currentUser || likeLoading || esDuenoDelLibro) return;

    const previousLiked = liked;
    const previousCount = likesCount;
    const nextLiked = !previousLiked;

    setLiked(nextLiked);
    setLikesCount((prev) => {
      if (nextLiked) return prev + 1;
      return Math.max(prev - 1, 0);
    });

    try {
      setLikeLoading(true);

      const response = await toggleBookLike(book.id, currentUser);

      setLiked(Boolean(response.liked));
      setLikesCount(response.likesCount || 0);
    } catch {
      setLiked(previousLiked);
      setLikesCount(previousCount);
    } finally {
      setLikeLoading(false);
    }
  }

  if (loading) return <p>Cargando libro...</p>;
  if (error) return <p>{error}</p>;
  if (!libroId) return <p>No se recibió el libro seleccionado.</p>;
  if (!book) return <p>Libro no encontrado.</p>;

  return (
    <section className="detalleLibroPage">
      <div className="detalleLibroCard">
        <img
          src={coverUrl || formData.coverUrl || "/assets/defaultBook.png"}
          alt={formData.title || "Portada del libro"}
          className="detalleLibroImage"
        />

        <div className="detalleLibroContent">
          <span className="heroBadge">
            {formData.category || "Sin categoría"}
          </span>

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
                <label>Estado</label>
                <input
                  type="text"
                  name="currentStatus"
                  value={formData.currentStatus}
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

              <p className="detalleAutor">
                {book.author || "Autor no especificado"}
              </p>

              <p className="detalleDescripcion">
                {book.description || "Sin descripción disponible."}
              </p>

              <div className="detalleMeta">
                <div className="metaItem">
                  <strong>Idioma</strong>
                  <span>{book.language || "N/A"}</span>
                </div>

                <div className="metaItem">
                  <strong>Estado</strong>
                  <span>
                    {book.currentStatus || book.current_status || "Activo"}
                  </span>
                </div>

                <div className="metaItem">
                  <strong>Subido por</strong>
                  <span>{uploadedByName}</span>
                </div>

                <div className="metaItem">
                  <strong>Me gusta</strong>
                  <span>{likesCount}</span>
                </div>
              </div>
            </>
          )}

          {saveMessage && <p className="saveMessage">{saveMessage}</p>}

          <div className="detalleActions">
            <button
              className="secondaryButton"
              onClick={() => navigate("/explorar-libros")}
            >
              Volver
            </button>

            <button
              className="primaryButton"
              onClick={() =>
                navigate("/lectura", { state: { libroId: book.id } })
              }
            >
              {tieneProgreso ? "Seguir lectura" : "Empezar lectura"}
            </button>

            {!esDuenoDelLibro && (
              <>
                <button className="secondaryButton" onClick={toggleFavorito}>
                  {esFavorito
                    ? "★ Quitar de biblioteca"
                    : "☆ Agregar a mi biblioteca"}
                </button>

                <button
                  className={`likeButton${liked ? " likeButtonActive" : ""}`}
                  onClick={handleLikeBook}
                  disabled={likeLoading}
                  aria-label={liked ? "Quitar me gusta" : "Dar me gusta"}
                  title={liked ? "Quitar me gusta" : "Dar me gusta"}
                >
                  <span>{liked ? "♥" : "♡"}</span>
                  <strong>{likesCount}</strong>
                </button>
              </>
            )}

            {esDuenoDelLibro && !isEditing && (
              <>
                <button
                  className="secondaryButton"
                  onClick={() => {
                    setIsEditing(true);
                    setSaveMessage("");
                  }}
                >
                  Editar libro
                </button>

                <button
                  className="dangerActionButton"
                  onClick={handleDeleteBook}
                >
                  Eliminar libro
                </button>
              </>
            )}

            {esDuenoDelLibro && isEditing && (
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