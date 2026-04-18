import { createContext, useContext, useEffect, useState } from "react";
import { getUsers } from "../services/booksService.js";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");

    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  async function login(email, password) {
    const users = await getUsers();

    const user = users.find(
      (item) => item.email === email && item.password === password
    );

    if (!user) {
      throw new Error("Correo o contraseña incorrectos");
    }

    setCurrentUser(user);
    localStorage.setItem("currentUser", JSON.stringify(user));

    return user;
  }

  function logout() {
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        logout,
        isAuthenticated: Boolean(currentUser),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}