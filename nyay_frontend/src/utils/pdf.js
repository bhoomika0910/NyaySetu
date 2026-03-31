import jsPDF from "jspdf";

export function downloadTextAsPdf(title, body) {
  const doc = new jsPDF();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(title, 14, 20);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  const split = doc.splitTextToSize(body, 180);
  doc.text(split, 14, 32);
  doc.save(`${title}.pdf`);
}
