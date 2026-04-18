import { createContext, useContext, useEffect, useState } from "react";
import { getUserById } from "../services/usersService.js";

const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("currentUser");
    return saved ? JSON.parse(saved) : null;
  });

  const [loadingUser, setLoadingUser] = useState(false);

  const isAuthenticated = !!currentUser;

  function login(user) {
    setCurrentUser(user);
    localStorage.setItem("currentUser", JSON.stringify(user));
  }

  function logout() {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  }

  async function refreshCurrentUser() {
    if (!currentUser?.id) return;

    try {
      setLoadingUser(true);

      const updatedUser = await getUserById(currentUser.id);

      setCurrentUser(updatedUser);

      localStorage.setItem(
        "currentUser",
        JSON.stringify(updatedUser)
      );

    } catch (error) {
      console.error("Error refrescando usuario:", error);
    } finally {
      setLoadingUser(false);
    }
  }

  useEffect(() => {

    async function syncUser() {

      const saved = localStorage.getItem("currentUser");

      if (!saved) return;

      const parsed = JSON.parse(saved);

      if (!parsed?.id) return;

      try {

        const freshUser = await getUserById(parsed.id);

        setCurrentUser(freshUser);

        localStorage.setItem(
          "currentUser",
          JSON.stringify(freshUser)
        );

      } catch (error) {

        console.warn("No se pudo sincronizar usuario con API");

      }

    }

    syncUser();

  }, []);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,

        isAuthenticated,
        loadingUser,

        login,
        logout,

        refreshCurrentUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}