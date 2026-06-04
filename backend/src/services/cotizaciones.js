import { cleanText } from "../utils/text.js";

const IVA_RATE = 0.15;
const ESTADOS = new Set(["borrador", "enviada", "aprobada"]);

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function roundMoney(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function getEstado(value, fallback = "borrador") {
  const estado = cleanText(value || fallback).toLowerCase();
  return ESTADOS.has(estado) ? estado : fallback;
}

export function getCotizacionPayload(body) {
  return {
    cliente_id: cleanText(body.cliente_id),
    fecha: cleanText(body.fecha) || new Date().toISOString().slice(0, 10),
    vencimiento: cleanText(body.vencimiento) || null,
    notas: cleanText(body.notas) || null,
    estado: getEstado(body.estado),
  };
}

export function getItemsPayload(items) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => {
      const cantidad = toNumber(item.cantidad);
      const precioUnitario = toNumber(item.precio_unitario);
      const total = roundMoney(cantidad * precioUnitario);

      return {
        descripcion: cleanText(item.descripcion),
        cantidad,
        precio_unitario: roundMoney(precioUnitario),
        total,
      };
    })
    .filter((item) => item.descripcion && item.cantidad > 0 && item.precio_unitario >= 0);
}

export function calculateTotals(items) {
  const subtotal = roundMoney(items.reduce((sum, item) => sum + item.total, 0));
  const iva = roundMoney(subtotal * IVA_RATE);
  const total = roundMoney(subtotal + iva);

  return { subtotal, iva, total };
}
