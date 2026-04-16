"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function WorkerDashboard() {
  const [worker, setWorker] = useState(null);
  const [image, setImage] = useState(null);

  useEffect(() => {
    const id = localStorage.getItem("workerID") || "1234"; 
    const unsub = onSnapshot(doc(db, "workers", id), (docSnap) => {
      if (docSnap.exists()) setWorker({ id: docSnap.id, ...docSnap.data() });
    });
    return () => unsub();
  }, []);

  const handleMarkPresent = async () => {
    if (!image) return alert("Pehle Photo Capture karein!");
    const workerRef = doc(db, "workers", worker.id);
    const now = new Date();
    
    await updateDoc(workerRef, {
      pendingAttendance: arrayUnion({
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString(),
        photo: image,
        status: "Pending"
      })
    });
    setImage(null);
    alert("Attendance Admin ko bhej di gayi hai.");
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text(`JAMIL CONTRACTOR - Worker Report`, 10, 10);
    doc.text(`Worker: ${worker.name} (ID: ${worker.id})`, 10, 20);
    doc.autoTable({
      startY: 30,
      head: [['Total Advance', 'Total Cut', 'Balance']],
      body: [[`Rs.${worker.totalAdvance || 0}`, `Rs.${worker.totalDeducted || 0}`, `Rs.${(worker.totalAdvance || 0) - (worker.totalDeducted || 0)}`]],
    });
    doc.save(`${worker.name}_History.pdf`);
  };

  if (!worker) return <div style={{color:'#fff', textAlign:'center', marginTop:'50px'}}>Loading...</div>;

  return (
    <div style={styles.container}>
      {/* ID CARD */}
      <div style={styles.idCard}>
        <div style={styles.cardHeader}>
          <span>JC</span>
          <div style={{textAlign:'right'}}>
            <h4 style={{margin:0}}>JAMIL CONTRACTOR</h4>
            <p style={{margin:0, fontSize:'10px'}}>WORKER ID CARD</p>
          </div>
        </div>
        <div style={styles.details}>
          <h2 style={{margin:0}}>{worker.name}</h2>
          <p style={{color:'#888'}}>ID NO: {worker.id}</p>
          <div style={styles.financeGrid}>
            <div style={styles.finBox}><span>Advance</span><br/><b>₹{worker.totalAdvance || 0}</b></div>
            <div style={styles.finBox}><span>Kataya</span><br/><b>₹{worker.totalDeducted || 0}</b></div>
            <div style={styles.finBox}><span>Baki</span><br/><b>₹{(worker.totalAdvance || 0) - (worker.totalDeducted || 0)}</b></div>
          </div>
        </div>
      </div>

      <div style={styles.actionCard}>
        <h3>Daily Attendance</h3>
        <input type="file" accept="image/*" capture="camera" onChange={(e) => {
          const reader = new FileReader();
          reader.onload = (ev) => setImage(ev.target.result);
          reader.readAsDataURL(e.target.files[0]);
        }} style={{marginBottom:'10px'}} />
        <button onClick={handleMarkPresent} style={styles.presentBtn}>✅ Mark Present</button>
      </div>

      <button onClick={downloadPDF} style={styles.pdfBtn}>📥 Download Full History PDF</button>
    </div>
  );
}

const styles = {
  container: { padding: '20px', background: 'linear-gradient(135deg, #764ba2, #667eea)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' },
  idCard: { background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '350px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' },
  cardHeader: { background: '#764ba2', color: '#fff', padding: '15px', display: 'flex', justifyContent: 'space-between' },
  details: { padding: '20px', textAlign: 'center' },
  financeGrid: { display: 'flex', justifyContent: 'space-around', marginTop: '15px', background: '#f8f9fa', padding: '15px', borderRadius: '12px' },
  finBox: { fontSize: '12px', color: '#333' },
  actionCard: { background: '#fff', padding: '20px', borderRadius: '20px', width: '100%', maxWidth: '350px', textAlign: 'center' },
  presentBtn: { width: '100%', padding: '12px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
  pdfBtn: { background: '#fff', color: '#764ba2', padding: '12px 25px', borderRadius: '50px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }
};
