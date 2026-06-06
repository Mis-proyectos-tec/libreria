import { createContext, useContext, useRef, useState } from "react";
import { getUsers, getCategories, getBooks } from "../services/booksService.js";

const AppDataContext = createContext();

export function AppDataProvider({ children }) {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetched = useRef({ books: false, categories: false, users: false });

  function normalizeBook(book) {
    return {
      ...book,
      userId: book.userId || book.user_id,
      coverBlobName: book.coverBlobName || book.cover_blob_name,
      pdfBlobName: book.pdfBlobName || book.pdf_blob_name,
    };
  }

  async function loadBooks() {
    if (fetched.current.books) return;
    fetched.current.books = true;
    setLoading(true);
    setError("");
    try {
      const data = await getBooks();
      setBooks(Array.isArray(data) ? data.map(normalizeBook) : []);
    } catch {
      fetched.current.books = false;
      setError("No se pudieron cargar los libros.");
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    if (fetched.current.categories) return;
    fetched.current.categories = true;
    try {
      const data = await getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      fetched.current.categories = false;
    }
  }

  async function loadUsers() {
    if (fetched.current.users) return;
    fetched.current.users = true;
    try {
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      fetched.current.users = false;
    }
  }

  async function reloadBooks() {
    fetched.current.books = false;
    setBooks([]);
    await loadBooks();
  }

  async function reloadAppData() {
    fetched.current = { books: false, categories: false, users: false };
    setBooks([]);
    setCategories([]);
    setUsers([]);
    await Promise.all([loadBooks(), loadCategories(), loadUsers()]);
  }

  return (
    <AppDataContext.Provider
      value={{
        books,
        categories,
        users,
        loading,
        error,
        loadBooks,
        loadCategories,
        loadUsers,
        reloadBooks,
        reloadAppData,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  return useContext(AppDataContext);
}
