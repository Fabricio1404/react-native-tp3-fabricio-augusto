/**
 * Estado global de la app (reportes, avisos, borrador y preferencias).
 * Store mínimo en memoria basado en useSyncExternalStore: no guarda permisos,
 * porque esos siempre se consultan al sistema (ver src/hooks/usePermiso.ts).
 */
import { useSyncExternalStore } from 'react';

export type EstadoReporte = 'pendiente' | 'en curso' | 'resuelto';
export type Categoria = 'electricidad' | 'agua' | 'mobiliario' | 'equipos';
export type Sector = 'aula' | 'pasillo' | 'patio' | 'estacionamiento' | 'baños' | 'otro';

export const CATEGORIAS: Categoria[] = ['electricidad', 'agua', 'mobiliario', 'equipos'];
export const SECTORES: Sector[] = ['aula', 'pasillo', 'patio', 'estacionamiento', 'baños', 'otro'];

export type Ubicacion = {
  latitud: number;
  longitud: number;
  /** true si el sistema solo entregó ubicación aproximada (coarse / reduced). */
  aproximada: boolean;
};

export type Reporte = {
  id: string;
  titulo: string;
  descripcion: string;
  aula: string;
  categoria: Categoria;
  fotoUri: string | null;
  ubicacion: Ubicacion | null;
  sector: Sector | null;
  estado: EstadoReporte;
  creado: number;
};

export type Aviso = {
  id: string;
  reporteId: string;
  titulo: string;
  cuerpo: string;
  fecha: number;
  leido: boolean;
};

export type Borrador = Omit<Reporte, 'id' | 'estado' | 'creado'>;

type Estado = {
  reportes: Reporte[];
  avisos: Aviso[];
  borrador: Borrador;
  avisarResolucion: boolean;
};

const borradorVacio: Borrador = {
  titulo: '',
  descripcion: '',
  aula: '',
  categoria: 'electricidad',
  fotoUri: null,
  ubicacion: null,
  sector: null,
};

let estado: Estado = {
  reportes: [],
  avisos: [],
  borrador: borradorVacio,
  avisarResolucion: false,
};

const oyentes = new Set<() => void>();

function actualizar(cambio: (anterior: Estado) => Estado) {
  estado = cambio(estado);
  oyentes.forEach((oyente) => oyente());
}

function suscribir(oyente: () => void) {
  oyentes.add(oyente);
  return () => {
    oyentes.delete(oyente);
  };
}

export function useStore<T>(selector: (estado: Estado) => T): T {
  return useSyncExternalStore(
    suscribir,
    () => selector(estado),
    () => selector(estado),
  );
}

export function getEstado() {
  return estado;
}

const nuevoId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

export function editarBorrador(cambios: Partial<Borrador>) {
  actualizar((e) => ({ ...e, borrador: { ...e.borrador, ...cambios } }));
}

export function guardarBorrador(): Reporte {
  const reporte: Reporte = {
    ...estado.borrador,
    id: nuevoId(),
    estado: 'pendiente',
    creado: Date.now(),
  };
  actualizar((e) => ({ ...e, reportes: [reporte, ...e.reportes], borrador: borradorVacio }));
  return reporte;
}

export function cambiarEstadoReporte(id: string, nuevo: EstadoReporte) {
  actualizar((e) => ({
    ...e,
    reportes: e.reportes.map((r) => (r.id === id ? { ...r, estado: nuevo } : r)),
  }));
}

export function agregarAviso(aviso: Omit<Aviso, 'id' | 'fecha' | 'leido'>) {
  actualizar((e) => ({
    ...e,
    avisos: [{ ...aviso, id: nuevoId(), fecha: Date.now(), leido: false }, ...e.avisos],
  }));
}

export function marcarAvisosLeidos() {
  actualizar((e) => ({ ...e, avisos: e.avisos.map((a) => ({ ...a, leido: true })) }));
}

export function setAvisarResolucion(valor: boolean) {
  actualizar((e) => ({ ...e, avisarResolucion: valor }));
}
