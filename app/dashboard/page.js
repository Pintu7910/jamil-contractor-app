"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';

// Components Import
import IDCard from '../components/IDCard';
import FinanceLedger from '../components/FinanceLedger';
import AttendanceControl from '../components/AttendanceControl';
import { downloadWorkerHistory } from '../utils/pdfGenerator';

export default function WorkerDashboard() {
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Worker ID '1234' ka data Firebase se load ho raha hai
    const id = "1234"; 
    const unsub = onSnapshot(doc(db, "workers", id), (snap) => {
      if (snap.exists()) {
        setWorker({ id: snap.id, ...snap.data() });
      } else {
        console.log("Worker not found");
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Professional Attendance Logic (Paisa katne aur haziri ka logic)
  const handleMarkAttendance = async () => {
    const today = new Date().toLocaleDateString('en-GB');
    
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
        status: "Online"
      });
      alert("✅ Haziri kamyabi se lag gayi!");
    } catch (error) {
      alert("Error: Attendance nahi lag payi.");
    }
  };

  // Loading Screen
  if (loading) return (
    <div style={{
      textAlign:'center', padding:'100px 20px', color:'#fff', 
      background: '#764ba2', minHeight: '100vh', fontFamily:'sans-serif'
    }}>
      <h3>JAMIL CONTRACTOR</h3>
      <p>Data load ho raha hai...</p>
    </div>
  );

  // Agar worker data nahi mila
  if (!worker) return (
    <div style={{
      textAlign:'center', padding:'100px 20px', color:'#d63031', 
      background: '#fff', minHeight: '100vh', fontFamily:'sans-serif'
    }}>
      <h2>Oops! Problem Aa Gayi</h2>
      <p>Worker ID '1234' database mein nahi mili.</p>
      <button onClick={() => window.location.reload()} style={{padding: '10px 20px', marginTop: '20px'}}>Refresh Karein</button>
    </div>
  );

  return (
    <div style={styles.dashboardLayout}>
      {/* 🏛️ Main Header */}
      <header style={{textAlign:'center', color:'#fff', marginBottom:'10px'}}>
        <h2 style={{margin:0, fontSize: '20px', letterSpacing:'1px'}}>MD JAMIL ANSARI</h2>
        <p style={{fontSize:'12px', opacity:0.8}}>Worker Dashboard Control</p>
      </header>

      {/* 1. ID Card - Full Width aur Authentic Look */}
      <div style={styles.contentWrapper}>
        <IDCard worker={worker} />
      </div>

      {/* 2. Attendance Controls - Haziri lagane ke liye */}
      <div style={styles.contentWrapper}>
        <AttendanceControl 
          onMarkAttendance={handleMarkAttendance} 
          attendanceHistory={worker.approvedAttendance} 
        />
      </div>

      {/* 3. Premium Finance Ledger - Naya bada aur uncha design */}
      <div style={styles.contentWrapper}>
        <FinanceLedger worker={worker} />
      </div>

      {/* 4. PDF Download Button */}
      <button 
        onClick={() => downloadWorkerHistory(worker)} 
        style={styles.pdfBtn}
      >
        📥 Download My Full Record (PDF)
      </button>

      {/* Footer Details */}
      <footer style={{textAlign:'center', color:'#fff', fontSize:'10px', marginTop:'20px', opacity:0.6}}>
        © 2026 Jamil Contractor System | Jamshedpur
      </footer>
    </div>
  );
}

// Global Dashboard Styles
const styles = {
  dashboardLayout: {
    padding: '20px 15px',
    background: 'linear-gradient(180deg, #764ba2 0%, #667eea 100%)', // Theme color
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '5px',
    fontFamily: '"Segoe UI", sans-serif'
  },
  contentWrapper: {
    width: '100%',
    maxWidth: '400px', // Mobile screens ke liye perfect width
  },
  pdfBtn: {
    width: '100%',
    maxWidth: '400px',
    marginTop: '15px',
    padding: '16px',
    borderRadius: '15px',
    border: '1px solid rgba(255,255,255,0.4)',
    background: 'rgba(255,255,255,0.2)',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '14px',
    cursor: 'pointer',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
  }
};
