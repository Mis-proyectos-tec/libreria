const SUBSCRIPTION_KEY = import.meta.env.VITE_API_SUBSCRIPTION_KEY;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const defaultHeaders = {
  "Content-Type": "application/json",
  "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY,
};

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Error HTTP: ${response.status}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

/* USERS */
export function getUsers() {
  return apiRequest("/users", {
    method: "GET",
    headers: {
      "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY,
    },
  });
}

export function getUserById(id) {
  return apiRequest(`/users/${id}`, {
    method: "GET",
    headers: {
      "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY,
    },
  });
}

export function createUser(user) {
  return apiRequest("/users", {
    method: "POST",
    body: JSON.stringify(user),
  });
}

export function updateUser(id, user) {
  return apiRequest(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(user),
  });
}

export function deleteUser(id) {
  return apiRequest(`/users/${id}`, {
    method: "DELETE",
    headers: {
      "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY,
    },
  });
}

/* CATEGORIES */
/* CATEGORIES - TEMPORAL */
export async function getCategories() {
  return [
    { id: 1, name: "General" },
    { id: 2, name: "Matemática" },
    { id: 3, name: "Programación" },
    { id: 4, name: "Administración" },
    { id: 5, name: "Inglés" },
  ];
}

/* BOOKS */
export function getBooks() {
  return apiRequest("/books", {
    method: "GET",
  });
}

// Temporal: mientras no tengamos conectado GET /books/{id} en Azure Functions,
// buscamos el libro dentro de la lista general.
export async function getBookById(id) {
  const books = await getBooks();
  const book = books.find((item) => String(item.id) === String(id));

  if (!book) {
    throw new Error("Libro no encontrado.");
  }

  return {
    ...book,
    currentStatus: book.currentStatus || book.current_status || "activo",
    isPublic: book.isPublic ?? book.is_public ?? true,
    userId: book.userId || book.user_id || null,
    coverUrl: book.coverUrl || null,
  };
}

export function getBookFileUrl(id) {
  return apiRequest(`/books/${id}/file-url`, {
    method: "GET",
  });
}

export function getBookCoverUrl(id) {
  return apiRequest(`/books/${id}/cover-url`, {
    method: "GET",
  });
}

export async function openBookPdf(id) {
  const data = await getBookFileUrl(id);

  if (!data?.fileUrl) {
    throw new Error("No se pudo obtener la URL del PDF.");
  }

  window.open(data.fileUrl, "_blank");
  return data;
}

export function generateUploadUrl(file) {
  if (!file) {
    throw new Error("Debe seleccionar un archivo.");
  }

  return apiRequest("/generate-upload-url", {
    method: "POST",
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
    }),
  });
}

export async function uploadFileToBlob(file) {
  const uploadData = await generateUploadUrl(file);

  const uploadResponse = await fetch(uploadData.uploadUrl, {
    method: "PUT",
    headers: {
      "x-ms-blob-type": "BlockBlob",
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error(`Error subiendo archivo a Blob: ${uploadResponse.status}`);
  }

  return uploadData.blobName;
}

export function createBook(book) {
  return apiRequest("/books", {
    method: "POST",
    body: JSON.stringify(book),
  });
}

export async function createBookWithPdf(bookData, pdfFile, coverFile = null) {
  if (!pdfFile) {
    throw new Error("Debe seleccionar un PDF.");
  }

  const pdfBlobName = await uploadFileToBlob(pdfFile);

  let coverBlobName = null;

  if (coverFile) {
    coverBlobName = await uploadFileToBlob(coverFile);
  }

  const newBook = {
    userId: bookData.userId,
    title: bookData.title,
    author: bookData.author,
    description: bookData.description,
    category: bookData.category,
    language: bookData.language || "es",
    currentStatus: bookData.currentStatus || "activo",
    isPublic: bookData.isPublic ?? true,
    pdf_blob_name: pdfBlobName,
    cover_blob_name: coverBlobName,
  };

  return createBook(newBook);
}

// Pendiente: todavía no conectamos PUT /books/{id} en Azure Functions.
export function updateBook(id, book) {
  return apiRequest(`/books/${id}`, {
    method: "PUT",
    body: JSON.stringify(book),
  });
}

export function deleteBook(id) {
  return apiRequest(`/books/${id}`, {
    method: "DELETE",
  });
}

/* READING PROGRESS */
export function getReadingProgress() {
  return apiRequest("/reading-progress", {
    method: "GET",
    headers: {
      "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY,
    },
  });
}

export function getReadingProgressById(id) {
  return apiRequest(`/reading-progress/${id}`, {
    method: "GET",
    headers: {
      "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY,
    },
  });
}

export function createReadingProgress(progress) {
  return apiRequest("/reading-progress", {
    method: "POST",
    body: JSON.stringify(progress),
  });
}

export function updateReadingProgress(id, progress) {
  return apiRequest(`/reading-progress/${id}`, {
    method: "PUT",
    body: JSON.stringify(progress),
  });
}

export function deleteReadingProgress(id) {
  return apiRequest(`/reading-progress/${id}`, {
    method: "DELETE",
    headers: {
      "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY,
    },
  });
}

/* FAVORITES */
export function getFavorites() {
  return apiRequest("/favorites", {
    method: "GET",
    headers: {
      "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY,
    },
  });
}

export function getFavoriteById(id) {
  return apiRequest(`/favorites/${id}`, {
    method: "GET",
    headers: {
      "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY,
    },
  });
}

export function createFavorite(favorite) {
  return apiRequest("/favorites", {
    method: "POST",
    body: JSON.stringify(favorite),
  });
}

export function deleteFavorite(id) {
  return apiRequest(`/favorites/${id}`, {
    method: "DELETE",
    headers: {
      "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY,
    },
  });
}