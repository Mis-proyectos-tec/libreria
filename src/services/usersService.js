const SUBSCRIPTION_KEY = "b23b54a59f4f449eb64d507b55ea93e3";
const API_BASE_URL = "https://librosapi.azure-api.net/v1/books";

const jsonHeaders = {
  "Content-Type": "application/json",
  "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY
};

const authHeaders = {
  "Ocp-Apim-Subscription-Key": SUBSCRIPTION_KEY
};

export async function getUsers() {
  const response = await fetch(API_BASE_URL, {
    method: "GET",
    headers: authHeaders
  });

  if (!response.ok) {
    throw new Error(`Error HTTP: ${response.status}`);
  }

  return response.json();
}

export async function getUserById(id) {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "GET",
    headers: authHeaders
  });

  if (!response.ok) {
    throw new Error(`Error HTTP: ${response.status}`);
  }

  return response.json();
}

export async function createUser(user) {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(user)
  });

  if (!response.ok) {
    throw new Error(`Error HTTP: ${response.status}`);
  }

  return response.json();
}

export async function updateUser(id, user) {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    headers: jsonHeaders,
    body: JSON.stringify(user)
  });

  if (!response.ok) {
    throw new Error(`Error HTTP: ${response.status}`);
  }

  return response.json();
}

export async function deleteUser(id) {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
    headers: authHeaders
  });

  if (!response.ok) {
    throw new Error(`Error HTTP: ${response.status}`);
  }

  return response.json();
}