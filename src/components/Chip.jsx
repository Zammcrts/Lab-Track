// Etiqueta de estado. color: rojo | ambar | verde | oscuro | gris
export default function Chip({ color = 'gris', children }) {
  return <span className={`chip chip-${color}`}>{children}</span>
}
