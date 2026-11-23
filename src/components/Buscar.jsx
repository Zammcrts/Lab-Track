import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Bell, Check, Plus, Search, ShoppingBag } from 'lucide-react'
import { useAuth } from '../useAuth'
import { useMateriales } from '../useDatos'
import Pagina from './Pagina'
import { Encabezado } from './Encabezado'
import EquipoIcono from './EquipoIcono'
import Cargando from './Cargando'
import { activarAviso, guardarBolsita, quitarAviso } from '../data/usuarios'
import { CATEGORIAS, disponibilidad, filtrarMateriales, ordenarPorDisponibilidad } from '../logic/catalogo'

export default function Buscar() {
  const { usuario, perfil } = useAuth()
  const { materiales, cargando } = useMateriales()
  const [parametros] = useSearchParams()
  const [texto, setTexto] = useState(parametros.get('q') || '')
  const [categoria, setCategoria] = useState('Todos')

  const bolsita = perfil.bolsita || []
  const avisos = perfil.avisos || []
  const resultados = ordenarPorDisponibilidad(filtrarMateriales(materiales, texto, categoria))

  function agregar(material) {
    const nueva = [...bolsita, { materialId: material.id, cantidad: 1 }]
    // Si es el primer artículo, empieza a contar el apartado de 24 h.
    guardarBolsita(usuario.uid, nueva, perfil.bolsitaDesde || new Date())
  }

  function quitar(material) {
    const nueva = bolsita.filter((item) => item.materialId !== material.id)
    guardarBolsita(usuario.uid, nueva, nueva.length ? perfil.bolsitaDesde : null)
  }

  function alternarAviso(material) {
    if (avisos.includes(material.id)) quitarAviso(usuario.uid, material.id)
    else activarAviso(usuario.uid, material.id)
  }

  return (
    <Pagina
      conBusqueda={false}
      hero={
        <>
          <Encabezado
            titulo="Buscar equipo"
            subtitulo="Agrega lo que necesites a tu bolsita y solicítalo en un solo paso."
            acciones={
              <Link to="/bolsita" className="boton boton-blanco boton-grande">
                <ShoppingBag size={20} /> Ver bolsita ( {bolsita.length} )
              </Link>
            }
          />
          <div className="busqueda-grande">
            <label className="campo-busqueda">
              <Search size={22} />
              <input type="search" placeholder="Nombre, modelo o código de inventario"
                value={texto} onChange={(e) => setTexto(e.target.value)} />
            </label>
          </div>
          <div className="categorias">
            {['Todos', ...CATEGORIAS].map((c) => (
              <button key={c} type="button" className={`categoria ${categoria === c ? 'activa' : ''}`}
                onClick={() => setCategoria(c)}>
                {c}
              </button>
            ))}
          </div>
        </>
      }
    >
      <p className="texto-suave">{resultados.length} resultados · ordenados por disponibilidad</p>

      {cargando && <Cargando enLinea />}
      {!cargando && resultados.length === 0 && (
        <div className="tarjeta tarjeta-vacia">
          <h3>Sin resultados</h3>
          <p className="texto-suave">Prueba con otro nombre, código o categoría.</p>
        </div>
      )}

      <div className="rejilla-equipos">
        {resultados.map((m) => {
          const estado = disponibilidad(m)
          const agotado = m.disponibles === 0
          const enBolsita = bolsita.some((item) => item.materialId === m.id)
          const conAviso = avisos.includes(m.id)

          return (
            <article key={m.id} className="tarjeta-equipo">
              <div className={`equipo-foto ${agotado ? 'equipo-foto-gris' : ''}`}>
                <EquipoIcono variante={agotado ? 'gris' : 'rosa'} tamano="xl" />
              </div>
              <div className="equipo-datos">
                <p className="antetitulo-tarjeta">{m.categoria}</p>
                <h3>{m.nombre}</h3>
                <p className="texto-suave">{m.codigo} · máx. {m.maxDias} días</p>
              </div>
              <div className="equipo-pie">
                <span className={`disponibilidad texto-${estado.color}`}>{estado.texto}</span>

                {agotado && (
                  <button type="button" className={`boton boton-chico ${conAviso ? 'boton-rosa' : 'boton-gris'}`}
                    onClick={() => alternarAviso(m)}>
                    {conAviso ? <><Bell size={16} /> Te avisaremos</> : 'Avisarme'}
                  </button>
                )}
                {!agotado && enBolsita && (
                  <button type="button" className="boton boton-chico boton-rosa" onClick={() => quitar(m)}>
                    <Check size={16} /> En bolsita
                  </button>
                )}
                {!agotado && !enBolsita && (
                  <button type="button" className="boton boton-chico boton-primario" onClick={() => agregar(m)}>
                    <Plus size={16} /> Agregar
                  </button>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </Pagina>
  )
}
