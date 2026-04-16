import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const downloadWorkerHistory = (worker) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(18);
  doc.text("JAMIL CONTRACTOR - WORKER REPORT", 14, 20);
  
  // Worker Details
  doc.setFontSize(12);
  doc.text(`Name: ${worker.name}`, 14, 30);
  doc.text(`Worker ID: ${worker.id}`, 14, 37);

  // Table for Finance
  doc.autoTable({
    startY: 45,
    head: [['Description', 'Amount']],
    body: [
      ['Total Advance Liya', `Rs. ${worker.totalAdvance}`],
      ['Total Advance Kataya', `Rs. ${worker.totalDeducted}`],
      ['Baki Balance (Pending)', `Rs. ${worker.totalAdvance - worker.totalDeducted}`],
    ],
  });

  doc.save(`${worker.name}_History.pdf`);
};
