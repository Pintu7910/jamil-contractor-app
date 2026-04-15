"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function WorkerDashboard() {
  const [worker, setWorker] = useState(null);
  const [image, setImage] = useState(null);

  useEffect(() => {
    const id = localStorage.getItem("workerID");
    if (!id) { window.location.href = "/"; return; }

    const unsub = onSnapshot(doc(db, "workers", id), (docSnap) => {
      if (docSnap.exists()) setWorker({ id: docSnap.id, ...docSnap.data() });
    });
    return () => unsub();
  }, []);

  // 1. Attendance Logic (Status Update)
  const markAttendance = async (status) => {
    if (!image && status === "WORKING") return alert("Pehle Photo lein!");
    
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const workerRef = doc(db, "workers", worker.id);
      const now = new Date();
      
      const newEntry = {
        status: status,
        time: now.toLocaleTimeString(),
        date: now.toLocaleDateString(),
        location: { lat: pos.coords.latitude, lng: pos.coords.longitude },
        photo: image || null
      };

      await updateDoc(workerRef, {
        currentStatus: status,
        lastUpdated: serverTimestamp(),
        attendanceHistory: arrayUnion(newEntry)
      });

      setImage(null);
      alert(`Attendance Mark Ho Gayi: ${status}`);
    });
  };

  // 2. PDF Download Logic
  const downloadReport = () => {
    const doc = new jsPDF();
    doc.text(`Worker Report: ${worker.name}`, 10, 10);
    doc.text(`Jamil Contractor - ID: ${worker.id}`, 10, 20);
    
    // Financial Table
    doc.autoTable({
      startY: 30,
      head: [['Total Advance', 'Total Paid', 'Balance']],
      body: [[`Rs.${worker.totalAdvance || 0}`, `Rs.${worker.totalDeducted || 0}`, `Rs.${(worker.totalAdvance || 0) - (worker.totalDeducted || 0)}`]],
    });

    // Attendance Table
    const attendanceData = (worker.attendanceHistory || []).map(a => [a.date, a.time, a.status]);
    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Date', 'Time', 'Status']],
      body: attendanceData,
    });

    doc.save(`${worker.name}_Report.pdf`);
  };

  return (
    <div style={styles.container}>
      {/* SECTION 1: ID CARD */}
      <div style={styles.idCard}>
        <div style={styles.cardHeader}>
          <span>JC</span>
          <div style={{textAlign:'right'}}>
            <h4 style={{margin:0}}>JAMIL CONTRACTOR</h4>
            <p style={{margin:0, fontSize:'10px'}}>WORKER ID CARD</p>
          </div>
        </div>
        <div style={styles.photoBox}>
          <img src={worker?.attendanceHistory?.[0]?.photo || "/placeholder.jpg"} style={styles.workerPhoto} alt="Worker" />
        </div>
        <div style={styles.details}>
          <h2 style={{margin:0}}>{worker?.name}</h2>
          <p style={{color:'#888'}}>ID NO: {worker?.id}</p>
          <div style={styles.financePanel}>
            <p>Wages: <strong>Rs.{worker?.wages || 0}/day</strong></p>
            <p>Advance Liya: <span style={{color:'red'}}>Rs.{worker?.totalAdvance || 0}</span></p>
            <p>Katwaya: <span style={{color:'green'}}>Rs.{worker?.totalDeducted || 0}</span></p>
            <p><strong>Bakaya: Rs.{(worker?.totalAdvance || 0) - (worker?.totalDeducted || 0)}</strong></p>
          </div>
        </div>
      </div>

      {/* SECTION 2: ATTENDANCE BUTTONS */}
      <div style={styles.actionBox}>
        <h3>Daily Attendance</h3>
        <input type="file" accept="image/*" capture="camera" onChange={(e) => {
          const reader = new FileReader();
          reader.onload = (ev) => setImage(ev.target.result);
          reader.readAsDataURL(e.target.files[0]);
        }} style={{marginBottom:'10px'}} />
        
        <div style={styles.btnGroup}>
          <button style={{...styles.btn, background:'#22c55e'}} onClick={() => markAttendance("WORKING")}>Start Working</button>
          <button style={{...styles.btn, background:'#eab308'}} onClick={() => markAttendance("RELAXING")}>Take Break</button>
          <button style={{...styles.btn, background:'#ef4444'}} onClick={() => markAttendance("OUT")}>Leave Site</button>
        </div>
      </div>

      {/* SECTION 3: DOWNLOAD REPORT */}
      <button style={styles.downloadBtn} onClick={downloadReport}>📄 Download PDF Report</button>
    </div>
  );
}

const styles = {
  container: { padding: '20px', background: 'linear-gradient(to bottom, #764ba2, #667eea)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' },
  idCard: { background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '350px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' },
  cardHeader: { background: '#764ba2', color: '#fff', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  photoBox: { textAlign: 'center', padding: '20px', background: '#f9f9f9' },
  workerPhoto: { width: '120px', height: '120px', borderRadius: '50%', border: '4px solid #764ba2', objectFit: 'cover' },
  details: { padding: '20px', textAlign: 'center' },
  financePanel: { background: '#f0f2f5', padding: '15px', borderRadius: '15px', marginTop: '15px', textAlign: 'left', fontSize: '13px' },
  actionBox: { background: 'rgba(255,255,255,0.9)', padding: '20px', borderRadius: '20px', width: '100%', maxWidth: '350px', textAlign: 'center' },
  btnGroup: { display: 'flex', flexDirection: 'column', gap: '10px' },
  btn: { padding: '12px', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' },
  downloadBtn: { padding: '15px 30px', background: '#fff', color: '#764ba2', border: 'none', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 5px 15px rgba(0,0,0,0.1)' }
};
