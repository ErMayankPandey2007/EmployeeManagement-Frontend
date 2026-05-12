import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Export data to an Excel (.xlsx) file
 * @param {Array} data - Array of objects to export
 * @param {String} filename - Name of the output file (without extension)
 */
export const exportToExcel = (data, filename) => {
  if (!data || data.length === 0) return;
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

/**
 * Export data to a PDF file with a table format
 * @param {Array} columns - Array of column header strings OR objects { header: 'Name', dataKey: 'name' }
 * @param {Array} data - Array of objects or arrays matching the columns
 * @param {String} filename - Name of the output file (without extension)
 * @param {String} title - Title to print at the top of the PDF
 */
export const exportToPDF = (columns, data, filename, title = "Exported Data") => {
  if (!data || data.length === 0) return;
  const doc = new jsPDF();
  
  // Add a simple title
  doc.setFontSize(16);
  doc.text(title, 14, 15);
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

  // AutoTable plugin
  doc.autoTable({
    head: [columns],
    body: data,
    startY: 28,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [79, 70, 229] }, // matching primary color loosely
  });

  doc.save(`${filename}.pdf`);
};
