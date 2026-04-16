"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';

// Components Import
import IDCard from '../components/IDCard';
import FinanceLedger from '../components/FinanceLedger';
import AttendanceControl from '../components/AttendanceControl'; // Naya Component Folder
import { downloadWorkerHistory } from '../utils/pdfGenerator';

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

  // Professional Attendance Logic (No Image)
  const handleMarkAttendance = async () => {
    const today = new Date().toLocaleDateString('en-GB'); // Example: 16/04/2026
    
    // Check if attendance already marked for today
    const alreadyMarked = worker.approvedAttendance?.some(entry => entry.date === today);
    
    if (alreadyMarked) {
      alert("⚠️ Aaj ki haziri pehle hi lag chuki hai!");
      return;
    }

    try {
      const workerRef = doc(db, "workers", worker.id);
      await updateDoc(workerRef, {
        approvedAttendance: arrayUnion({
          date: today,
          time: new Date().toLocaleTimeString(),
          status: "Present"
        }),
        status: "Online" // Haziri lagte hi status Online dikhayega
      });
      alert("✅ Haziri kamyabi se lag gayi!");
    } catch (error) {
      console.error("Error marking attendance:", error);
      alert("Error: Attendance nahi lag payi.");
    }
  };

  if (loading) return (
    <div style={{textAlign:'center', padding:'50px', color:'#fff', fontFamily:'sans-serif'}}>
      <h3>JAMIL CONTRACTOR</h3>
      <p>Data load ho raha hai...</p>
    </div>
  );

  return (
    <div style={styles.dashboardLayout}>
      {/* 🏛️ App Header */}
      <header style={{textAlign:'center', color:'#fff', marginBottom:'5px'}}>
        <h2 style={{margin:0, letterSpacing:'1px'}}>MD JAMIL ANSARI</h2>
        <p style={{fontSize:'12px', opacity:0.8}}>Worker Dashboard Control</p>
      </header>

      {/* 1. ID Card Section (Upar) */}
      <IDCard worker={worker} />

      {/* 2. Attendance Control Section (Haziri & History) */}
      <AttendanceControl 
        onMarkAttendance={handleMarkAttendance} 
        attendanceHistory={worker.approvedAttendance} 
      />

      {/* 3. Finance Ledger Section (Hisab-Kitab) */}
      <FinanceLedger worker={worker} />

      {/* 4. PDF Download Button */}
      <button 
        onClick={() => downloadWorkerHistory(worker)} 
        style={styles.pdfBtn}
      >
        📥 Download My Full Record (PDF)
      </button>

      <footer style={{textAlign:'center', color:'#fff', fontSize:'10px', marginTop:'20px', opacity:0.6}}>
        © 2026 Jamil Contractor System | Jamshedpur
      </footer>
    </div>
  );
}

const styles = {
  dashboardLayout: {
    padding: '15px',
    background: 'linear-gradient(180deg, #764ba2 0%, #667eea 100%)',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    fontFamily: '"Segoe UI", sans-serif'
  },
  pdfBtn: {
    width: '100%',
    maxWidth: '360px',
    margin: '10px auto',
    padding: '16px',
    borderRadius: '15px',
    border: 'none',
    background: 'rgba(255,255,255,0.2)',
    color: '#fff',
    fontWeight: 'bold',
    cursor: 'pointer',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.3)'
  }
};
