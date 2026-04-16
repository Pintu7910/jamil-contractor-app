"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';

// Saare Folders/Components Import Karein
import IDCard from '../components/IDCard';
import FinanceLedger from '../components/FinanceLedger';
import AttendanceBox from '../components/AttendanceBox';
import { compressWorkerImage } from '../utils/imageCompressor'; // Compression Folder
import { downloadWorkerHistory } from '../utils/pdfGenerator';    // PDF Folder

export default function WorkerDashboard() {
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1234 ID ka data load karein
    const id = "1234"; 
    const unsub = onSnapshot(doc(db, "workers", id), (snap) => {
      if (snap.exists()) {
        setWorker({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Attendance Mark karne ka Logic with Compression
  const handleAttendance = async (rawFile) => {
    if (!rawFile) return;

    // 1. Image Compress Folder Logic
    const compressedBase64 = await compressWorkerImage(rawFile);
    
    if (compressedBase64) {
      const workerRef = doc(db, "workers", worker.id);
      const now = new Date();

      // 2. Database Update Logic
      await updateDoc(workerRef, {
        pendingAttendance: arrayUnion({
          date: now.toLocaleDateString(),
          time: now.toLocaleTimeString(),
          photo: compressedBase64,
          status: "Pending Approval"
        })
      });

      alert("Photo compressed aur attendance bhej di gayi hai!");
    }
  };

  if (loading) return <div style={{textAlign:'center', padding:'50px', color:'#fff'}}>Connecting to Jamil Contractor DB...</div>;

  return (
    <div style={styles.dashboardLayout}>
      {/* 🏛️ App Header */}
      <header style={{textAlign:'center', color:'#fff', marginBottom:'10px'}}>
        <h2 style={{margin:0}}>MD JAMIL ANSARI</h2>
        <p style={{fontSize:'12px', opacity:0.8}}>Worker Control Panel</p>
      </header>

      {/* 🪪 ID Card Component */}
      <IDCard worker={worker} />

      {/* 💰 Finance Component */}
      <FinanceLedger worker={worker} />

      {/* 📸 Attendance Component (Image Compression Included) */}
      <AttendanceBox onMark={handleAttendance} />

      {/* 📄 PDF History Folder */}
      <button 
        onClick={() => downloadWorkerHistory(worker)} 
        style={styles.pdfBtn}
      >
        📥 Download My Full Record (PDF)
      </button>

      <footer style={{textAlign:'center', color:'#fff', fontSize:'10px', marginTop:'20px'}}>
        © 2026 Jamil Contractor System
      </footer>
    </div>
  );
}

const styles = {
  dashboardLayout: {
    padding: '20px',
    background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  pdfBtn: {
    width: '100%',
    maxWidth: '360px',
    margin: '10px auto',
    padding: '15px',
    borderRadius: '50px',
    border: 'none',
    background: '#fff',
    color: '#764ba2',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
  }
};
