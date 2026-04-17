import { useNavigate } from "react-router-dom";

export default function BookCard({
  titulo,
  autor,
  portada,
  progreso,
  mostrarProgreso = false,
}) {

  const navigate = useNavigate();

  return (
    <article
      className="bookCard"
      onClick={() => navigate("/lectura")}
      style={{ cursor: "pointer" }}
    >
      <img
        src={portada}
        alt={titulo}
        className="bookCardImage"
      />

      <div className="bookCardBody">
        <h3>{titulo}</h3>
        <p>{autor}</p>

        {mostrarProgreso && (
          <p>{progreso}% leído</p>
        )}
      </div>
    </article>
  );
}