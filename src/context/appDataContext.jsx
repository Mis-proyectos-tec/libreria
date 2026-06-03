import { createContext, useContext, useEffect, useState } from "react";
import {
  getUsers,
  getCategories,
  getBooks,
  getReadingProgress,
  getFavorites,
} from "../services/booksService.js";

const AppDataContext = createContext();

export function AppDataProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [books, setBooks] = useState([]);
  const [readingProgress, setReadingProgress] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAppData() {
    try {
      setLoading(true);
      setError("");

      const [usersRes, categoriesRes, booksRes, progressRes, favoritesRes] =
        await Promise.allSettled([
          getUsers(),
          getCategories(),
          getBooks(),
          getReadingProgress(),
          getFavorites(),
        ]);

      const val = (r) => (r.status === "fulfilled" && Array.isArray(r.value) ? r.value : []);

      // Normalizar libros: asegurar que tengan userId consistente
      const normalizeBooks = (booksArray) => {
        return booksArray.map((book) => ({
          ...book,
          userId: book.userId || book.user_id,
        }));
      };

      setUsers(val(usersRes));
      setCategories(val(categoriesRes));
      setBooks(normalizeBooks(val(booksRes)));
      setReadingProgress(val(progressRes));
      setFavorites(val(favoritesRes));
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar la información de la app.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAppData();
  }, []);

  return (
    <AppDataContext.Provider
      value={{
        users,
        categories,
        books,
        readingProgress,
        favorites,
        loading,
        error,
        reloadAppData: loadAppData,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  return useContext(AppDataContext);
}