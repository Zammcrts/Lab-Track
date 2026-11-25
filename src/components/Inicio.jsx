import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, History, QrCode, Search, ShoppingBag } from 'lucide-react'
import { useAuth } from '../useAuth'
import { useAhora, useMisPrestamos } from '../useDatos'
import Pagina from './Pagina'
import { Encabezado, Estadisticas } from './Encabezado'
import Chip from './Chip'
import EquipoIcono from './EquipoIcono'
import ModalQR from './ModalQR'
import { renovarPrestamo } from '../data/prestamos'
import { mensajeDeError } from '../logic/auth'
import { aFecha, diaRelativo, diasEntre, fechaCorta, fechaLarga, hora, nombreDia, tiempoRestante } from '../logic/fechas'
import {
  DIAS_RENOVACION, ESTADOS, contarPiezas, etiquetaEstado, nombrePrestamo, ordenarPorFecha, puedeRenovar, resumenInicio,
} from '../logic/prestamos'

// Tarjeta "Próximo a vencer"
function ProximoAVencer({ prestamo, ahora }) {
  const [mensaje, setMensaje] = useState('')

  if (!prestamo) {
    return (
      <article className="tarjeta tarjeta-vacia">
        <p className="antetitulo-tarjeta">Próximo a vencer</p>
        <h3>No tienes material en préstamo</h3>
        <Link to="/buscar" className="boton boton-primario">Buscar equipo</Link>
      </article>
    )
  }

  const estado = etiquetaEstado(prestamo, ahora)
  const inicio = aFecha(prestamo.fechaInicio)
  const limite = aFecha(prestamo.fechaLimite)
  const avance = Math.min(100, ((ahora - inicio) / (limite - inicio)) * 100)

  async function renovar() {
    try {
      await renovarPrestamo(prestamo)
      setMensaje(`Renovado ${DIAS_RENOVACION} días más.`)
    } catch (error) {
      setMensaje(mensajeDeError(error))
    }
  }

  return (
    <article className="tarjeta">
      <div className="fila-entre">
        <p className="antetitulo-tarjeta">Próximo a vencer</p>
        <Chip color={estado.color}>{estado.texto}</Chip>
      </div>
      <div className="destacado">
        <EquipoIcono tamano="lg" />
        <div className="destacado-texto">
          <h3>{nombrePrestamo(prestamo)}</h3>
          <p className="texto-suave">
            {contarPiezas(prestamo)} pieza(s) · prestado el {fechaCorta(prestamo.fechaInicio)}
          </p>
        </div>
        <div className="destacado-hora">
          <span className="hora-grande hora-roja">{hora(limite)}</span>
          <span className="texto-suave">{diaRelativo(limite, ahora)}</span>
        </div>
      </div>
      <div className="progreso">
        <span style={{ width: `${avance}%` }} />
      </div>
      <div className="fila-entre progreso-pie">
        <span className="texto-suave">{diasEntre(inicio, limite)} días de préstamo</span>
        <strong className="texto-rojo">Faltan {tiempoRestante(limite, ahora)}</strong>
      </div>
      {mensaje && <p className="alerta alerta-exito">{mensaje}</p>}
      <div className="botones-par">
        <button type="button" className="boton boton-secundario" onClick={renovar} disabled={!puedeRenovar(prestamo, ahora)}>
          Renovar {DIAS_RENOVACION} días
        </button>
        <Link to="/prestamos" className="boton boton-primario">Ver préstamo</Link>
      </div>
    </article>
  )
}

// Tarjeta oscura "Listo para recoger"
function ListoParaRecoger({ prestamo, ahora }) {
  const [verQR, setVerQR] = useState(false)

  if (!prestamo) {
    return (
      <article className="tarjeta tarjeta-oscura tarjeta-vacia">
        <p className="antetitulo-tarjeta">Listo para recoger</p>
        <h3>Nada por recoger</h3>
        <p>Cuando el laboratorio apruebe una solicitud, aparecerá aquí con tu código.</p>
      </article>
    )
  }

  return (
    <article className="tarjeta tarjeta-oscura">
      <div className="fila-entre">
        <p className="antetitulo-tarjeta">Listo para recoger</p>
        <Chip color="oscuro-claro">Pick-up {diaRelativo(prestamo.fechaInicio, ahora).toLowerCase()}</Chip>
      </div>
      <div className="destacado">
        <EquipoIcono tamano="lg" variante="oscuro" bolsa />
        <div className="destacado-texto">
          <h3>{nombrePrestamo(prestamo)}</h3>
          <p>Mostrador A · trae tu credencial</p>
        </div>
        <div className="destacado-hora">
          <span className="hora-grande">{hora(prestamo.fechaInicio)}</span>
          <span>en {tiempoRestante(prestamo.fechaInicio, ahora)}</span>
        </div>
      </div>
      <div className="codigo-recoleccion">
        <QrCode size={30} strokeWidth={1.5} />
        <div>
          <span>Código de recolección</span>
          <strong>{prestamo.codigo}</strong>
        </div>
        <button type="button" className="boton boton-blanco" onClick={() => setVerQR(true)}>Mostrar QR</button>
      </div>
      {verQR && <ModalQR prestamo={prestamo} ahora={ahora} onCerrar={() => setVerQR(false)} />}
    </article>
  )
}

// Lista "Esta semana": lo que hay que recoger o devolver en los próximos 7 días.
function EstaSemana({ prestamos, ahora }) {
  const eventos = []
  for (const p of prestamos) {
    if (p.estado === ESTADOS.RESERVADO) eventos.push({ id: p.id, tipo: 'Recoger', fecha: aFecha(p.fechaInicio), prestamo: p })
    if (p.estado === ESTADOS.ENTREGADO) eventos.push({ id: p.id, tipo: 'Devolver', fecha: aFecha(p.fechaLimite), prestamo: p })
  }
  const semana = eventos.filter((e) => diasEntre(ahora, e.fecha) <= 7).sort((a, b) => a.fecha - b.fecha)

  return (
    <article className="tarjeta">
      <div className="fila-entre tarjeta-titulo">
        <h3>Esta semana</h3>
        <Link to="/prestamos" className="enlace-rojo">Ver todo</Link>
      </div>
      {semana.length === 0 && <p className="texto-suave">No tienes entregas ni recolecciones esta semana.</p>}
      <ul className="lista-eventos">
        {semana.map((evento) => {
          const dias = diasEntre(ahora, evento.fecha)
          let chip = { color: 'verde', texto: `${dias} días` }
          if (evento.tipo === 'Recoger') chip = { color: 'oscuro', texto: 'Pick-up' }
          else if (dias <= 0) chip = { color: 'rojo', texto: 'Vence hoy' }
          else if (dias === 1) chip = { color: 'ambar', texto: 'Mañana' }

          return (
            <li key={evento.id}>
              <span className="caja-dia">
                <small>{dias === 0 ? 'HOY' : nombreDia(evento.fecha).toUpperCase()}</small>
                <strong>{evento.fecha.getDate()}</strong>
              </span>
              <span className="evento-texto">
                <strong>{evento.tipo} {nombrePrestamo(evento.prestamo)}</strong>
                <small>{hora(evento.fecha)} · Mostrador A</small>
              </span>
              <Chip color={chip.color}>{chip.texto}</Chip>
            </li>
          )
        })}
      </ul>
    </article>
  )
}

export default function Inicio() {
  const { usuario, perfil } = useAuth()
  const prestamos = useMisPrestamos(usuario.uid)
  const ahora = useAhora()
  const resumen = resumenInicio(prestamos, ahora)
  const ordenados = ordenarPorFecha(prestamos)

  const proximo = ordenados.find((p) => p.estado === ESTADOS.ENTREGADO)
  const porRecoger = ordenados.find((p) => p.estado === ESTADOS.RESERVADO)
  const devueltos = prestamos.filter((p) => p.estado === ESTADOS.DEVUELTO).length
  const enBolsita = perfil.bolsita?.length || 0

  return (
    <Pagina
      hero={
        <>
          <Encabezado
            antetitulo={fechaLarga(ahora)}
            titulo={`Hola, ${perfil.nombre.split(' ')[0]}`}
            subtitulo={`Hoy tienes ${resumen.venceHoy} devolución(es) y ${resumen.recogerHoy} recolección(es) pendientes.`}
          />
          <Estadisticas
            datos={[
              { valor: resumen.activos, texto: 'Préstamos activos' },
              { valor: resumen.venceHoy, texto: 'Vence hoy' },
              { valor: resumen.porRecoger, texto: 'Por recoger' },
              { valor: resumen.porcentajeATiempo === null ? '—' : `${resumen.porcentajeATiempo}%`, texto: 'Devoluciones a tiempo' },
            ]}
          />
        </>
      }
    >
      <div className="rejilla-2">
        <ProximoAVencer prestamo={proximo} ahora={ahora} />
        <ListoParaRecoger prestamo={porRecoger} ahora={ahora} />
        <EstaSemana prestamos={prestamos} ahora={ahora} />

        <article className="tarjeta">
          <h3 className="tarjeta-titulo">Accesos rápidos</h3>
          <div className="accesos">
            <Link to="/buscar" className="acceso-rapido">
              <span className="acceso-icono"><Search size={22} /></span>
              <span className="acceso-texto"><strong>Buscar equipo</strong><small>Consulta disponibilidad en tiempo real</small></span>
              <ChevronRight size={20} />
            </Link>
            <Link to="/bolsita" className="acceso-rapido">
              <span className="acceso-icono"><ShoppingBag size={22} /></span>
              <span className="acceso-texto"><strong>Mi bolsita · {enBolsita} artículos</strong><small>Apartados por 24 h</small></span>
              <ChevronRight size={20} />
            </Link>
            <Link to="/historial" className="acceso-rapido">
              <span className="acceso-icono"><History size={22} /></span>
              <span className="acceso-texto"><strong>Historial</strong><small>{devueltos} préstamos anteriores</small></span>
              <ChevronRight size={20} />
            </Link>
          </div>
        </article>
      </div>
    </Pagina>
  )
}
