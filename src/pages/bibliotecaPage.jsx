import BookCard from "../components/bookCard.jsx";

import principitoImg from "../assets/books/principito.jpg";
import libro1984Img from "../assets/books/1984.jpg";
import donquijoteImg from "../assets/books/donquijote.jpg";
import orgulloPrejuicioImg from "../assets/books/orgulloyprejuicio.jpg";
import draculaImg from "../assets/books/dracula.jpg";
import fahrenheitImg from "../assets/books/fahrenheit.jpg";

const libros = [
  {
    id: 1,
    titulo: "El Principito",
    autor: "Antoine de Saint-Exupéry",
    portada: principitoImg,
  },
  {
    id: 2,
    titulo: "1984",
    autor: "George Orwell",
    portada: libro1984Img,
  },
  {
    id: 3,
    titulo: "Drácula",
    autor: "Bram Stoker",
    portada: draculaImg,
  },
  {
    id: 4,
    titulo: "Don Quijote",
    autor: "Miguel de Cervantes",
    portada: donquijoteImg,
  },
  {
    id: 5,
    titulo: "Orgullo y Prejuicio",
    autor: "Jane Austen",
    portada: orgulloPrejuicioImg,
  },
  {
    id: 6,
    titulo: "Fahrenheit 451",
    autor: "Ray Bradbury",
    portada: fahrenheitImg,
  },
];

export default function BibliotecaPage() {
  return (
    <section className="bibliotecaPage">
      <div className="sectionHeader">
        <h1>Biblioteca</h1>
        <p>Explora todos los libros disponibles</p>
      </div>

      <div className="booksGrid">
        {libros.map((libro) => (
          <BookCard
            key={libro.id}
            titulo={libro.titulo}
            autor={libro.autor}
            portada={libro.portada}
          />
        ))}
      </div>
    </section>
  );
}