// Lista de artículos de un préstamo: "Arduino UNO R3 × 1"
export default function ListaArticulos({ items }) {
  return (
    <ul className="celda-lista">
      {items.map((item) => (
        <li key={item.materialId}>
          {item.nombre} <span className="texto-suave">× {item.cantidad}</span>
        </li>
      ))}
    </ul>
  )
}
