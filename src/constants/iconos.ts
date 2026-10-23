/** Ícono y color de cada categoría, estado y permiso. */
import { Marca } from '@/constants/theme';
import type { Recurso } from '@/lib/permisos';
import type { Categoria, Sector } from '@/lib/store';

export const CATEGORIA_INFO: Record<Categoria, { emoji: string; color: string }> = {
  electricidad: { emoji: '💡', color: '#eab308' },
  agua: { emoji: '🚰', color: '#0ea5e9' },
  mobiliario: { emoji: '🪑', color: '#a16207' },
  equipos: { emoji: '📽️', color: '#7c3aed' },
};

export const SECTOR_EMOJI: Record<Sector, string> = {
  aula: '🏫',
  pasillo: '🚪',
  patio: '🌳',
  estacionamiento: '🅿️',
  baños: '🚻',
  otro: '📌',
};

export const ESTADO_COLOR: Record<string, string> = {
  pendiente: Marca.naranja,
  'en curso': Marca.azulClaro,
  resuelto: Marca.verde,
  concedido: Marca.verde,
  preguntable: Marca.naranja,
  bloqueado: Marca.rojo,
  parcial: Marca.violeta,
  cargando: '#64748b',
};

export const RECURSO_EMOJI: Record<Recurso, string> = {
  camara: '📷',
  ubicacion: '📍',
  notificaciones: '🔔',
  fotos: '🖼️',
};
