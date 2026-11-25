import { Cpu } from 'lucide-react'

const NOMBRE_LAB = 'Lab IA & RE'

export default function Logo({ grande = false }) {
  return (
    <div className={`logo ${grande ? 'logo-grande' : ''}`}>
      <span className="logo-icono" aria-hidden="true">
        <Cpu strokeWidth={2} />
      </span>
      <span className="logo-texto">{NOMBRE_LAB}</span>
    </div>
  )
}
