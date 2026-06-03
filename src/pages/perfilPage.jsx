import { useState } from "react";
import { useAuth } from "../context/authContext.jsx";

export default function PerfilPage() {
  const {
    currentUser,
    updateProfileName,
    updateProfileUsername,
    updateProfileEmail,
    updateProfilePassword,
  } = useAuth();

  const [activeSection, setActiveSection] = useState(null);
  const [saveMessage, setSaveMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [nameValue, setNameValue] = useState(currentUser?.name || "");
  const [usernameValue, setUsernameValue] = useState(currentUser?.username || "");

  const [emailForm, setEmailForm] = useState({
    currentPassword: "",
    newEmail: currentUser?.email || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  if (!currentUser) return <p>No hay usuario autenticado.</p>;

  function getInitials(name = "") {
    return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
  }

  function resetMessages() {
    setSaveMessage("");
    setErrorMessage("");
  }

  function openSection(section) {
    setActiveSection(section);
    resetMessages();
  }

  function closeSection() {
    setActiveSection(null);
    resetMessages();
    setNameValue(currentUser?.name || "");
    setUsernameValue(currentUser?.username || "");
    setEmailForm({ currentPassword: "", newEmail: currentUser?.email || "" });
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  }

  async function handleSaveName(e) {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    try {
      await updateProfileName(nameValue);
      setSaveMessage("Nombre actualizado correctamente.");
      setActiveSection(null);
    } catch {
      setErrorMessage("No se pudo actualizar el nombre.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveUsername(e) {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    try {
      await updateProfileUsername(usernameValue);
      setSaveMessage("Nombre de usuario actualizado correctamente.");
      setActiveSection(null);
    } catch {
      setErrorMessage("No se pudo actualizar el nombre de usuario.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveEmail(e) {
    e.preventDefault();
    resetMessages();
    setLoading(true);
    try {
      await updateProfileEmail(emailForm.currentPassword, emailForm.newEmail);
      setSaveMessage("Correo actualizado correctamente.");
      setActiveSection(null);
      setEmailForm({ currentPassword: "", newEmail: emailForm.newEmail });
    } catch (error) {
      if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        setErrorMessage("La contraseña actual es incorrecta.");
      } else if (error.code === "auth/email-already-in-use") {
        setErrorMessage("Ese correo ya está en uso por otra cuenta.");
      } else {
        setErrorMessage("No se pudo actualizar el correo.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSavePassword(e) {
    e.preventDefault();
    resetMessages();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMessage("Las contraseñas nuevas no coinciden.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setErrorMessage("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setLoading(true);
    try {
      await updateProfilePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setSaveMessage("Contraseña actualizada correctamente.");
      setActiveSection(null);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        setErrorMessage("La contraseña actual es incorrecta.");
      } else {
        setErrorMessage("No se pudo actualizar la contraseña.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="perfilPage">
      <div className="perfilCard">

        <div className="perfilHeader">
          <div className="perfilAvatar">{getInitials(currentUser.name)}</div>
          <div className="perfilHeaderInfo">
            <h1>{currentUser.name}</h1>
            <p>@{currentUser.username} · {currentUser.email}</p>
          </div>
        </div>

        {saveMessage && <p className="saveMessage">{saveMessage}</p>}
        {errorMessage && <p className="unsavedWarning">{errorMessage}</p>}

        <div className="perfilGrid">

          <div className="perfilField">
            <label>Nombre completo</label>
            {activeSection === "name" ? (
              <form onSubmit={handleSaveName} style={{ display: "flex", gap: "8px" }}>
                <input type="text" value={nameValue} onChange={(e) => setNameValue(e.target.value)} required />
                <button className="primaryButton" type="submit" disabled={loading}>{loading ? "..." : "Guardar"}</button>
                <button className="secondaryButton" type="button" onClick={closeSection}>Cancelar</button>
              </form>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <p style={{ margin: 0 }}>{currentUser.name}</p>
                <button className="secondaryButton" onClick={() => openSection("name")}>Editar</button>
              </div>
            )}
          </div>

          <div className="perfilField">
            <label>Nombre de usuario</label>
            {activeSection === "username" ? (
              <form onSubmit={handleSaveUsername} style={{ display: "flex", gap: "8px" }}>
                <input type="text" value={usernameValue} onChange={(e) => setUsernameValue(e.target.value)} required />
                <button className="primaryButton" type="submit" disabled={loading}>{loading ? "..." : "Guardar"}</button>
                <button className="secondaryButton" type="button" onClick={closeSection}>Cancelar</button>
              </form>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <p style={{ margin: 0 }}>@{currentUser.username}</p>
                <button className="secondaryButton" onClick={() => openSection("username")}>Editar</button>
              </div>
            )}
          </div>

          <div className="perfilField">
            <label>Correo electrónico</label>
            {activeSection === "email" ? (
              <form onSubmit={handleSaveEmail}>
                <div className="formGroup">
                  <label>Nuevo correo</label>
                  <input type="email" value={emailForm.newEmail} onChange={(e) => setEmailForm((prev) => ({ ...prev, newEmail: e.target.value }))} required />
                </div>
                <div className="formGroup">
                  <label>Contraseña actual</label>
                  <input type="password" value={emailForm.currentPassword} onChange={(e) => setEmailForm((prev) => ({ ...prev, currentPassword: e.target.value }))} required />
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button className="primaryButton" type="submit" disabled={loading}>{loading ? "..." : "Guardar"}</button>
                  <button className="secondaryButton" type="button" onClick={closeSection}>Cancelar</button>
                </div>
              </form>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <p style={{ margin: 0 }}>{currentUser.email}</p>
                <button className="secondaryButton" onClick={() => openSection("email")}>Editar</button>
              </div>
            )}
          </div>

          <div className="perfilField">
            <label>Contraseña</label>
            {activeSection === "password" ? (
              <form onSubmit={handleSavePassword}>
                <div className="formGroup">
                  <label>Contraseña actual</label>
                  <input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))} required />
                </div>
                <div className="formGroup">
                  <label>Nueva contraseña</label>
                  <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))} required />
                </div>
                <div className="formGroup">
                  <label>Confirmar contraseña</label>
                  <input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))} required />
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button className="primaryButton" type="submit" disabled={loading}>{loading ? "..." : "Guardar"}</button>
                  <button className="secondaryButton" type="button" onClick={closeSection}>Cancelar</button>
                </div>
              </form>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <p style={{ margin: 0 }}>••••••••</p>
                <button className="secondaryButton" onClick={() => openSection("password")}>Cambiar</button>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
