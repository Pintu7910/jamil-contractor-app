import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const downloadWorkerHistory = (worker) => {
  if (!worker) return alert("Worker data not found!");

  const doc = new jsPDF();
  const today = new Date().toLocaleDateString('en-GB');

  // 1. Header Section
  doc.setFontSize(18);
  doc.setTextColor(118, 75, 162); // Theme Purple Color
  doc.text("JAMIL CONTRACTOR - WORKER REPORT", 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Report Generated On: ${today}`, 14, 28);

  // 2. Worker Info Table
  doc.autoTable({
    startY: 35,
    head: [['Field', 'Details']],
    body: [
      ['Worker Name', worker.name || 'N/A'],
      ['Worker ID', `JC/W/${worker.id || '----'}`],
      ['Total Attendance', `${worker.approvedAttendance?.length || 0} Days`],
      ['Daily Wage (Dihadi)', `Rs. ${worker.dailyWage || 0}`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [118, 75, 162] }
  });

  // 3. Finance Calculation Section
  const totalWages = (worker.approvedAttendance?.length || 0) * (worker.dailyWage || 0);
  const totalPaid = worker.totalDeducted || 0; // Jitna payment mil chuka hai
  const balance = totalWages - totalPaid;

  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text("Financial Summary", 14, doc.lastAutoTable.finalY + 15);

  doc.autoTable({
    startY: doc.lastAutoTable.finalY + 20,
    head: [['Description', 'Amount (Rs.)']],
    body: [
      ['Total Earnings (Kul Kamayi)', `Rs. ${totalWages}`],
      ['Total Paid (Dilaya Gaya)', `Rs. ${totalPaid}`],
      ['Balance (Baki Payment)', `Rs. ${balance}`],
    ],
    theme: 'striped',
    headStyles: { fillColor: [46, 204, 113] } // Green for Finance
  });

  // 4. Attendance Record Table (Asli List)
  if (worker.approvedAttendance && worker.approvedAttendance.length > 0) {
    doc.setFontSize(14);
    doc.text("Attendance Log", 14, doc.lastAutoTable.finalY + 15);
    
    const attendanceData = worker.approvedAttendance.map(item => [
      item.date,
      item.status || 'Present'
    ]);

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Date', 'Status']],
      body: attendanceData,
      theme: 'grid',
      headStyles: { fillColor: [52, 152, 219] } // Blue for Attendance
    });
  }

  // Save the PDF
  doc.save(`${worker.name || 'Worker'}_Report.pdf`);
};
