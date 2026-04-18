import { useEffect, useState } from "react";
import { useAuth } from "../context/authContext.jsx";
import { updateUser } from "../services/usersService.js";

export default function PerfilPage() {
  const { currentUser, updateCurrentUserLocally } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    if (!currentUser) return;

    setFormData({
      name: currentUser.name || "",
      email: currentUser.email || "",
    });
  }, [currentUser]);

  if (!currentUser) return <p>No hay usuario autenticado.</p>;

  function getInitials(name = "") {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("");
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSaveProfile() {
    try {
      const payload = {
        ...currentUser,
        name: formData.name,
        email: formData.email,
      };

      const updated = await updateUser(currentUser.id, payload);
      updateCurrentUserLocally(updated || payload);

      setSaveMessage("Perfil actualizado correctamente.");
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      setSaveMessage("No se pudo actualizar el perfil.");
    }
  }

  function handleCancel() {
    setFormData({
      name: currentUser.name || "",
      email: currentUser.email || "",
    });

    setSaveMessage("");
    setIsEditing(false);
  }

  return (
    <section className="perfilPage">
      <div className="perfilCard">
        <div className="perfilBanner"></div>

        <div className="perfilHeader">
          <div className="perfilAvatar">{getInitials(formData.name)}</div>

          <div className="perfilHeaderInfo">
            <h1>{formData.name}</h1>
            <p>{formData.email}</p>
          </div>

          {!isEditing ? (
            <button className="primaryButton" onClick={() => setIsEditing(true)}>
              Editar perfil
            </button>
          ) : (
            <div className="perfilActions">
              <button className="primaryButton" onClick={handleSaveProfile}>
                Guardar
              </button>
              <button className="secondaryButton" onClick={handleCancel}>
                Cancelar
              </button>
            </div>
          )}
        </div>

        {saveMessage && <p className="saveMessage">{saveMessage}</p>}

        <div className="perfilGrid">
          <div className="perfilField">
            <label>Nombre</label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            ) : (
              <p>{formData.name}</p>
            )}
          </div>

          <div className="perfilField">
            <label>Correo electrónico</label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            ) : (
              <p>{formData.email}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}