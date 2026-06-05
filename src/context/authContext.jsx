import { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { auth } from "../firebase.js";
import { getUserByFirebaseUid, createUser, updateUser } from "../services/usersService.js";

const AuthContext = createContext();

function deriveInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const apiUser = await getUserByFirebaseUid(firebaseUser.uid);
          setCurrentUser({ ...apiUser, uid: firebaseUser.uid });
        } catch {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoadingAuth(false);
    });

    return unsubscribe;
  }, []);

  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function register(name, username, email, password) {
    const credential = await createUserWithEmailAndPassword(auth, email, password);

    const apiUser = await createUser({
      username,
      name,
      email,
      password: "",
      initials: deriveInitials(name),
      firebaseUid: credential.user.uid,
    });

    setCurrentUser({ ...apiUser, uid: credential.user.uid });
    return credential;
  }

  async function logout() {
    await signOut(auth);
    setCurrentUser(null);
  }

  // Actualiza campos del perfil en Azure solamente
  async function updateAzureProfile(fields) {
    const { uid, ...azureData } = currentUser;
    const updated = await updateUser(currentUser.id, { ...azureData, ...fields });
    setCurrentUser((prev) => ({ ...prev, ...updated, uid: prev.uid }));
  }

  async function updateProfileName(name) {
    await updateAzureProfile({ name, initials: deriveInitials(name) });
  }

  async function updateProfileUsername(username) {
    await updateAzureProfile({ username });
  }

  // Actualiza email en Firebase + Azure
  async function updateProfileEmail(currentPassword, newEmail) {
    const credential = EmailAuthProvider.credential(
      auth.currentUser.email,
      currentPassword
    );
    await reauthenticateWithCredential(auth.currentUser, credential);
    await updateEmail(auth.currentUser, newEmail);
    await updateAzureProfile({ email: newEmail });
  }

  // Actualiza contraseña solo en Firebase
  async function updateProfilePassword(currentPassword, newPassword) {
    const credential = EmailAuthProvider.credential(
      auth.currentUser.email,
      currentPassword
    );
    await reauthenticateWithCredential(auth.currentUser, credential);
    await updatePassword(auth.currentUser, newPassword);
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        register,
        logout,
        updateProfileName,
        updateProfileUsername,
        updateProfileEmail,
        updateProfilePassword,
        isAuthenticated: Boolean(currentUser),
        loadingAuth,
      }}
    >
      {!loadingAuth && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
