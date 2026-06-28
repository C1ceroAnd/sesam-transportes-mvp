const PDFDocument = require('pdfkit');
const db = require('../db');

const COL_WIDTHS = [65, 110, 95, 85, 90, 55];
const COL_HEADERS = ['Data', 'Motivo', 'Embarque', 'Desembarque TH', 'Destino', 'Retorno'];
const START_X = 50;
const USABLE_WIDTH = 500;
const ROW_HEIGHT = 16;
const PAGE_BOTTOM_MARGIN = 80;

function truncate(str, maxChars) {
  if (!str) return '';
  return str.length > maxChars ? str.slice(0, maxChars - 1) + '…' : str;
}

function drawTableRow(doc, colValues, y, isHeader) {
  let x = START_X;
  doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(8);
  colValues.forEach((val, i) => {
    doc.text(truncate(String(val || ''), 30), x + 2, y + 3, {
      width: COL_WIDTHS[i] - 4,
      lineBreak: false,
    });
    x += COL_WIDTHS[i];
  });
}

function generatePDF(pacienteId) {
  const paciente = db.prepare('SELECT * FROM pacientes WHERE id = ?').get(pacienteId);
  if (!paciente) {
    const err = new Error('Paciente não encontrado');
    err.code = 404;
    throw err;
  }

  const rows = db.prepare(`
    SELECT a.motivo_deslocamento, a.ponto_desembarque_teresina, a.destino_consulta, a.status_retorno,
           v.data AS data_viagem
    FROM agendamentos a
    JOIN viagens v ON v.id = a.viagem_id
    WHERE a.paciente_id = ?
    ORDER BY v.data ASC
  `).all(pacienteId);

  if (rows.length === 0) return Promise.resolve(null);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve({ buffer: Buffer.concat(chunks), nome: paciente.nome }));
    doc.on('error', reject);

    // Title
    doc.fontSize(16).font('Helvetica-Bold').text('SESAM Transportes', { align: 'center' });
    doc.fontSize(12).font('Helvetica').text('Relatório de Histórico de Viagens', { align: 'center' });
    doc.fontSize(9).fillColor('#555').text(
      `Gerado em: ${new Date().toLocaleDateString('pt-BR')}`,
      { align: 'center' }
    );
    doc.fillColor('#000');
    doc.moveDown(0.8);

    // Divider
    const divY = doc.y;
    doc.moveTo(START_X, divY).lineTo(START_X + USABLE_WIDTH, divY).strokeColor('#ccc').stroke();
    doc.strokeColor('#000');
    doc.moveDown(0.6);

    // Patient header
    doc.fontSize(11).font('Helvetica-Bold').text('Dados do Paciente');
    doc.moveDown(0.3);
    doc.fontSize(10).font('Helvetica');
    doc.text(`Nome: ${paciente.nome}`);
    doc.text(`CPF: ${paciente.cpf}`);
    if (paciente.telefone) doc.text(`Telefone: ${paciente.telefone}`);
    doc.text(`Ponto de Embarque: ${paciente.ponto_embarque}`);
    doc.moveDown(0.8);

    // Table title
    doc.fontSize(11).font('Helvetica-Bold').text(`Viagens realizadas: ${rows.length}`);
    doc.moveDown(0.4);

    let y = doc.y;

    // Draw table header
    doc.rect(START_X, y, USABLE_WIDTH, ROW_HEIGHT).fill('#e0e8f0').stroke('#ccc');
    doc.fillColor('#000');
    drawTableRow(doc, COL_HEADERS, y, true);
    y += ROW_HEIGHT;

    // Draw data rows
    rows.forEach((row, i) => {
      // Page break guard
      if (y + ROW_HEIGHT > doc.page.height - PAGE_BOTTOM_MARGIN) {
        doc.addPage();
        y = 50;
        doc.rect(START_X, y, USABLE_WIDTH, ROW_HEIGHT).fill('#e0e8f0').stroke('#ccc');
        doc.fillColor('#000');
        drawTableRow(doc, COL_HEADERS, y, true);
        y += ROW_HEIGHT;
      }

      const rowFill = i % 2 === 0 ? '#ffffff' : '#f5f7fa';
      doc.rect(START_X, y, USABLE_WIDTH, ROW_HEIGHT).fill(rowFill).stroke('#e0e0e0');
      doc.fillColor('#000');

      const dataFormatada = new Date(row.data_viagem + 'T12:00:00').toLocaleDateString('pt-BR');
      drawTableRow(doc, [
        dataFormatada,
        row.motivo_deslocamento,
        paciente.ponto_embarque,
        row.ponto_desembarque_teresina,
        row.destino_consulta,
        row.status_retorno || 'Pendente',
      ], y, false);
      y += ROW_HEIGHT;
    });

    doc.end();
  });
}

module.exports = { generatePDF };
