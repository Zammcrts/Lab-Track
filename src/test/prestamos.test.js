import { describe, expect, it } from 'vitest'
import { diaRelativo, horariosRecoleccion, tiempoRestante } from '../logic/fechas'
import { disponibilidad, filtrarMateriales } from '../logic/catalogo'
import { validarSolicitud } from '../logic/bolsita'
import { ESTADOS, diasRetraso, etiquetaEstado, puedeRenovar, reporteRetrasos } from '../logic/prestamos'

// Sábado 14 de noviembre de 2026, 12:00
const ahora = new Date(2026, 10, 14, 12, 0)
const dia = (d, h = 15) => new Date(2026, 10, d, h, 0)

describe('fechas', () => {
  it('dice Hoy, Mañana o el día', () => {
    expect(diaRelativo(dia(14), ahora)).toBe('Hoy')
    expect(diaRelativo(dia(15), ahora)).toBe('Mañana')
    expect(diaRelativo(dia(20), ahora)).toBe('Vie 20')
  })

  it('calcula el tiempo restante', () => {
    expect(tiempoRestante(new Date(2026, 10, 14, 14, 15), ahora)).toBe('2 h 15 min')
    expect(tiempoRestante(dia(20), ahora)).toBe('6 días')
    expect(tiempoRestante(dia(13), ahora)).toBe('Vencido')
  })

  it('ofrece horarios futuros para reservar con anticipación', () => {
    const horarios = horariosRecoleccion(ahora)
    expect(horarios[0].getHours()).toBe(14) // las 10:00 de hoy ya pasaron
    expect(horarios.length).toBe(20) // 7 días × 3 horarios, menos el de las 10:00 de hoy
  })
})

describe('catálogo', () => {
  const materiales = [
    { id: '1', nombre: 'Sensor ultrasónico', codigo: 'SE-031', categoria: 'Sensores', disponibles: 15, activo: true },
    { id: '2', nombre: 'Jetson Nano', codigo: 'CI-001', categoria: 'Cómputo IA', disponibles: 0, activo: true },
    { id: '3', nombre: 'Retirado', codigo: 'XX-000', categoria: 'Sensores', disponibles: 1, activo: false },
  ]

  it('busca sin importar acentos y oculta lo dado de baja', () => {
    expect(filtrarMateriales(materiales, 'ULTRASONICO', 'Todos').length).toBe(1)
    expect(filtrarMateriales(materiales, '', 'Sensores').map((m) => m.id)).toEqual(['1'])
  })

  it('marca agotado y pocas piezas', () => {
    expect(disponibilidad({ disponibles: 0 }).texto).toBe('Agotado')
    expect(disponibilidad({ disponibles: 2 }).texto).toBe('Quedan 2')
    expect(disponibilidad({ disponibles: 8 }).texto).toBe('8 disponibles')
  })
})

describe('solicitud', () => {
  const articulos = [{ materialId: 'a', cantidad: 2, material: { nombre: 'Arduino', disponibles: 5 } }]

  it('acepta una solicitud válida', () => {
    expect(validarSolicitud({ articulos, aceptaReglamento: true, piezasActivas: 0 })).toEqual([])
  })

  it('respeta el límite de 6 piezas', () => {
    expect(validarSolicitud({ articulos, aceptaReglamento: true, piezasActivas: 5 })[0]).toContain('hasta 6 piezas')
  })

  it('no deja pedir más de lo disponible ni sin aceptar el reglamento', () => {
    const muchos = [{ materialId: 'a', cantidad: 3, material: { nombre: 'Arduino', disponibles: 1 } }]
    const errores = validarSolicitud({ articulos: muchos, aceptaReglamento: false, piezasActivas: 0 })
    expect(errores).toContain('Solo hay 1 de Arduino.')
    expect(errores).toContain('Debes aceptar el reglamento del laboratorio.')
  })
})

describe('préstamos', () => {
  const entregado = (limite) => ({ estado: ESTADOS.ENTREGADO, fechaLimite: limite, items: [] })

  it('etiqueta según la fecha límite', () => {
    expect(etiquetaEstado(entregado(dia(14)), ahora).texto).toBe('Vence hoy')
    expect(etiquetaEstado(entregado(dia(15)), ahora).texto).toBe('Por vencer')
    expect(etiquetaEstado(entregado(dia(25)), ahora).texto).toBe('En curso')
    expect(etiquetaEstado(entregado(dia(10)), ahora).texto).toBe('Vencido')
  })

  it('cuenta los días de retraso', () => {
    expect(diasRetraso({ fechaLimite: dia(4), fechaDevolucion: dia(5, 10) })).toBe(1)
    expect(diasRetraso({ fechaLimite: dia(4), fechaDevolucion: dia(4, 18) })).toBe(0)
  })

  it('solo deja renovar una vez y antes de vencer', () => {
    expect(puedeRenovar(entregado(dia(16)), ahora)).toBe(true)
    expect(puedeRenovar({ ...entregado(dia(16)), renovado: true }, ahora)).toBe(false)
    expect(puedeRenovar(entregado(dia(10)), ahora)).toBe(false)
  })

  it('ordena el reporte por devoluciones tardías', () => {
    const devuelto = (id, nombre, limite, entrega) => ({
      estado: ESTADOS.DEVUELTO, estudianteId: id, estudianteNombre: nombre, fechaLimite: limite, fechaDevolucion: entrega,
    })
    const reporte = reporteRetrasos([
      devuelto('a', 'Ana', dia(5), dia(7)),
      devuelto('b', 'Beto', dia(5), dia(6)),
      devuelto('b', 'Beto', dia(8), dia(9)),
      devuelto('c', 'Caro', dia(5), dia(5)),
    ])
    expect(reporte.map((r) => [r.nombre, r.tardias])).toEqual([['Beto', 2], ['Ana', 1]])
  })
})
