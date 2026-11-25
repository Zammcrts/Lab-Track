import { Cpu, ShoppingBag } from 'lucide-react'

// Recuadro con el ícono del equipo. variante: rosa | gris | oscuro
export default function EquipoIcono({ variante = 'rosa', tamano = 'md', bolsa = false }) {
  const Icono = bolsa ? ShoppingBag : Cpu
  return (
    <span className={`equipo-icono equipo-icono-${variante} equipo-icono-${tamano}`} aria-hidden="true">
      <Icono strokeWidth={1.75} />
    </span>
  )
}
