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
export function getCategories() {
  return apiRequest("/categories", {
    method: "GET",
    headers: {
      "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY,
    },
  });
}

/* BOOKS */
export function getBooks() {
  return apiRequest("/books", {
    method: "GET",
    headers: {
      "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY,
    },
  });
}

export function getBookById(id) {
  return apiRequest(`/books/${id}`, {
    method: "GET",
    headers: {
      "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY,
    },
  });
}

export function createBook(formData) {
  return fetch(`${API_BASE_URL}/books`, {
    method: "POST",
    headers: { "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY },
    body: formData,
  }).then((r) => {
    if (!r.ok) throw new Error(`Error HTTP: ${r.status}`);
    return r.json();
  });
}

export function updateBook(id, formData) {
  return fetch(`${API_BASE_URL}/books/${id}`, {
    method: "PUT",
    headers: { "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY },
    body: formData,
  }).then((r) => {
    if (!r.ok) throw new Error(`Error HTTP: ${r.status}`);
    return r.json();
  });
}

export function deleteBook(id) {
  return apiRequest(`/books/${id}`, {
    method: "DELETE",
    headers: {
      "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY,
    },
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