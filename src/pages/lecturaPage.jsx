import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LecturaPage() {
  const navigate = useNavigate();

  const libro = {
    titulo: "El Principito",
    autor: "Antoine de Saint-Exupéry",
    paginas: [
      `Cuando yo tenía seis años vi en un libro sobre la selva virgen una magnífica lámina.
Representaba una serpiente boa que se tragaba a una fiera. En el libro decía:
"Las boas tragan a sus presas enteras, sin masticarlas..."`,

      `Reflexioné mucho en ese momento sobre las aventuras de la jungla y, a mi vez,
logré trazar con un lápiz de colores mi primer dibujo. Mi dibujo número uno era así.
Enseñé mi obra maestra a las personas grandes y les pregunté si mi dibujo les daba miedo.`,

      `Me contestaron: "¿Por qué habría de asustar un sombrero?" Mi dibujo no representaba un sombrero.
Representaba una serpiente boa que digería un elefante. Dibujé entonces el interior de la serpiente
boa para que las personas grandes pudieran comprender.`,
    ],
  };

  const [paginaActual, setPaginaActual] = useState(0);
  const [tamanoFuente, setTamanoFuente] = useState(18);
  const [modoOscuroLectura, setModoOscuroLectura] = useState(false);
  const [anchoLectura, setAnchoLectura] = useState("normal");

  const totalPaginas = libro.paginas.length;
  const progreso = ((paginaActual + 1) / totalPaginas) * 100;

  const irPaginaAnterior = () => {
    if (paginaActual > 0) {
      setPaginaActual(paginaActual - 1);
    }
  };

  const irPaginaSiguiente = () => {
    if (paginaActual < totalPaginas - 1) {
      setPaginaActual(paginaActual + 1);
    }
  };

  const aumentarFuente = () => {
    setTamanoFuente(tamanoFuente + 2);
  };

  const disminuirFuente = () => {
    if (tamanoFuente > 14) {
      setTamanoFuente(tamanoFuente - 2);
    }
  };

  const cambiarTemaLectura = () => {
    setModoOscuroLectura(!modoOscuroLectura);
  };

  const cambiarAnchoLectura = () => {
    if (anchoLectura === "normal") {
      setAnchoLectura("amplio");
    } else {
      setAnchoLectura("normal");
    }
  };

  return (
    <section className="lecturaPage">
      <div className="readingWrapper">
        <header className="readingHeader">
          <div className="readingHeaderLeft">
            <button
              className="backButton"
              onClick={() => navigate("/biblioteca")}
            >
              ← Volver a biblioteca
            </button>

            <div>
              <p className="readingLabel">Modo lectura</p>
              <h1 className="readingTitle">{libro.titulo}</h1>
              <p className="readingAuthor">{libro.autor}</p>
            </div>
          </div>

          <div className="readingTools">
            <button className="toolButton" onClick={disminuirFuente}>
              A-
            </button>

            <button className="toolButton" onClick={aumentarFuente}>
              A+
            </button>

            <button className="toolButton" onClick={cambiarAnchoLectura}>
              {anchoLectura === "normal" ? "Ancho +" : "Ancho -"}
            </button>

            <button className="toolButton" onClick={cambiarTemaLectura}>
              {modoOscuroLectura ? "☀ Claro" : "🌙 Oscuro"}
            </button>
          </div>
        </header>

        <div className="readingProgressSection">
          <div className="readingProgressBar">
            <div
              className="readingProgressFill"
              style={{ width: `${progreso}%` }}
            ></div>
          </div>

          <p className="readingProgressText">
            Página {paginaActual + 1} de {totalPaginas} • {Math.round(progreso)}%
            completado
          </p>
        </div>

        <article
          className={`readingContainer ${modoOscuroLectura ? "readingDark" : ""} ${
            anchoLectura === "amplio" ? "readingWide" : "readingNormal"
          }`}
          style={{ fontSize: `${tamanoFuente}px` }}
        >
          <p className="readingText">{libro.paginas[paginaActual]}</p>
        </article>

        <div className="readingFooter">
          <button
            className="secondaryButton"
            onClick={irPaginaAnterior}
            disabled={paginaActual === 0}
          >
            ← Página anterior
          </button>

          <span className="readingPageIndicator">
            {paginaActual + 1} / {totalPaginas}
          </span>

          <button
            className="primaryButton"
            onClick={irPaginaSiguiente}
            disabled={paginaActual === totalPaginas - 1}
          >
            Página siguiente →
          </button>
        </div>
      </div>
    </section>
  );
}