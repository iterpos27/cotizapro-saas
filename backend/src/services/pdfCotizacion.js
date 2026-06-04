import PDFDocument from "pdfkit";

function formatMoney(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Date(`${value}T00:00:00`).toLocaleDateString("es-EC", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function writeRow(document, y, columns, options = {}) {
  const font = options.bold ? "Helvetica-Bold" : "Helvetica";
  document.font(font).fontSize(options.size || 9);

  columns.forEach((column) => {
    document.text(column.text, column.x, y, {
      width: column.width,
      align: column.align || "left",
    });
  });
}

export function createCotizacionPdf({ cotizacion, empresa }) {
  const document = new PDFDocument({ size: "A4", margin: 48 });
  const chunks = [];

  document.on("data", (chunk) => chunks.push(chunk));

  const finished = new Promise((resolve) => {
    document.on("end", () => resolve(Buffer.concat(chunks)));
  });

  document.font("Helvetica-Bold").fontSize(20).text(empresa.nombre || "Empresa", 48, 48);
  document.font("Helvetica").fontSize(10).fillColor("#64748b").text("Cotizacion", 48, 76);

  document.fillColor("#111827").font("Helvetica-Bold").fontSize(16).text(`Cotizacion #${cotizacion.numero}`, 360, 48, {
    width: 180,
    align: "right",
  });
  document.font("Helvetica").fontSize(10).text(`Estado: ${cotizacion.estado}`, 360, 72, {
    width: 180,
    align: "right",
  });
  document.text(`Fecha: ${formatDate(cotizacion.fecha)}`, 360, 88, {
    width: 180,
    align: "right",
  });
  document.text(`Vence: ${formatDate(cotizacion.vencimiento)}`, 360, 104, {
    width: 180,
    align: "right",
  });

  document.moveTo(48, 135).lineTo(547, 135).strokeColor("#d8e0ea").stroke();

  document.fillColor("#111827").font("Helvetica-Bold").fontSize(11).text("Cliente", 48, 160);
  document.font("Helvetica").fontSize(10).fillColor("#111827");
  document.text(cotizacion.cliente?.nombre || "-", 48, 180);
  document.fillColor("#64748b").text(cotizacion.cliente?.email || "-", 48, 196);
  document.text(cotizacion.cliente?.telefono || "-", 48, 212);

  const tableTop = 260;
  document.fillColor("#111827");
  writeRow(
    document,
    tableTop,
    [
      { text: "Descripcion", x: 48, width: 230 },
      { text: "Cant.", x: 300, width: 55, align: "right" },
      { text: "P. Unit.", x: 370, width: 75, align: "right" },
      { text: "Total", x: 465, width: 75, align: "right" },
    ],
    { bold: true },
  );
  document.moveTo(48, tableTop + 18).lineTo(547, tableTop + 18).strokeColor("#d8e0ea").stroke();

  let y = tableTop + 34;
  for (const item of cotizacion.items || []) {
    if (y > 700) {
      document.addPage();
      y = 60;
    }

    writeRow(document, y, [
      { text: item.descripcion, x: 48, width: 230 },
      { text: Number(item.cantidad).toFixed(2), x: 300, width: 55, align: "right" },
      { text: formatMoney(item.precio_unitario), x: 370, width: 75, align: "right" },
      { text: formatMoney(item.total), x: 465, width: 75, align: "right" },
    ]);
    y += 24;
  }

  const totalsTop = Math.max(y + 24, 620);
  writeRow(document, totalsTop, [{ text: "Subtotal", x: 370, width: 80 }, { text: formatMoney(cotizacion.subtotal), x: 465, width: 75, align: "right" }]);
  writeRow(document, totalsTop + 20, [{ text: "IVA", x: 370, width: 80 }, { text: formatMoney(cotizacion.iva), x: 465, width: 75, align: "right" }]);
  writeRow(
    document,
    totalsTop + 44,
    [{ text: "Total", x: 370, width: 80 }, { text: formatMoney(cotizacion.total), x: 465, width: 75, align: "right" }],
    { bold: true, size: 12 },
  );

  if (cotizacion.notas) {
    document.font("Helvetica-Bold").fontSize(10).text("Notas", 48, totalsTop);
    document.font("Helvetica").fontSize(10).fillColor("#64748b").text(cotizacion.notas, 48, totalsTop + 18, {
      width: 260,
    });
  }

  document.end();
  return finished;
}
