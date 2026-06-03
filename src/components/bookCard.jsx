import ProgressBar from "./ProgressBar.jsx";

export default function BookCard({
  titulo,
  autor,
  portada,
  progreso,
  mostrarProgreso = false,
}) {
  return (
    <article className="bookCard">
      <img
        src={portada}
        alt={`Portada de ${titulo}`}
        className="bookCardImage"
      />
      <div className="bookCardBody">
        <h3 className="bookCardTitle">{titulo}</h3>
        <p className="bookCardAuthor">{autor}</p>

        {mostrarProgreso && (
          <ProgressBar
            percentage={progreso}
            label={`${progreso}% leído`}
          />
        )}

        <button className="primaryButton">
          {mostrarProgreso ? "Continuar leyendo" : "Ver libro"}
        </button>
      </div>
    </article>
  );
}
