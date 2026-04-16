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
    // Worker ID '1234' ka real-time data load ho raha hai
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

  // Professional Attendance Logic
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
        status: "Online" // Dashboard par status green ho jayega
      });
      alert("✅ Haziri kamyabi se lag gayi!");
    } catch (error) {
      alert("Error: Attendance nahi lag payi.");
    }
  };

  // Loading Screen Style
  if (loading) return (
    <div style={{
      textAlign:'center', padding:'100px 20px', color:'#fff', 
      background: '#764ba2', minHeight: '100vh', fontFamily:'sans-serif'
    }}>
      <h3 style={{letterSpacing:'2px'}}>JAMIL CONTRACTOR</h3>
      <p style={{opacity:0.7}}>Data load ho raha hai...</p>
    </div>
  );

  // Agar worker data nahi mila toh clean error dikhega
  if (!worker) return (
    <div style={{
      textAlign:'center', padding:'100px 20px', color:'#d63031', 
      background: '#fff', minHeight: '100vh', fontFamily:'sans-serif'
    }}>
      <h2>Oops! Problem Aa Gayi</h2>
      <p>Worker ID '1234' database mein nahi mili.</p>
      <button onClick={() => window.location.reload()} style={{
        padding: '12px 25px', marginTop: '20px', borderRadius:'10px', 
        background:'#764ba2', color:'#fff', border:'none'
      }}>Refresh Karein</button>
    </div>
  );

  return (
    <div style={styles.dashboardLayout}>
      {/* 🏛️ App Header */}
      <header style={{textAlign:'center', color:'#fff', marginBottom:'15px'}}>
        <h2 style={{margin:0, fontSize: '22px', fontWeight:'800', letterSpacing:'1px'}}>MD JAMIL ANSARI</h2>
        <p style={{fontSize:'12px', opacity:0.8, fontWeight:'500'}}>Worker Dashboard Control</p>
      </header>

      {/* 1. Physical ID Badge Style Card */}
      <div style={styles.contentWrapper}>
        <IDCard worker={worker} />
      </div>

      {/* 2. Haziri (Attendance) Control Buttons */}
      <div style={styles.contentWrapper}>
        <AttendanceControl 
          onMarkAttendance={handleMarkAttendance} 
          attendanceHistory={worker.approvedAttendance} 
        />
      </div>

      {/* 3. Finance Ledger (Wages, Advance & Bakaya) */}
      <div style={styles.contentWrapper}>
        <FinanceLedger worker={worker} />
      </div>

      {/* 4. PDF Full Record Download */}
      <div style={styles.contentWrapper}>
        <button 
          onClick={() => downloadWorkerHistory(worker)} 
          style={styles.pdfBtn}
        >
          📥 Download My Full Record (PDF)
        </button>
      </div>

      {/* Footer Branded Line */}
      <footer style={{textAlign:'center', color:'#fff', fontSize:'10px', marginTop:'25px', opacity:0.6}}>
        © 2026 Jamil Contractor System | Jamshedpur
      </footer>
    </div>
  );
}

// Professional Dashboard Styles
const styles = {
  dashboardLayout: {
    padding: '25px 15px',
    background: 'linear-gradient(180deg, #764ba2 0%, #667eea 100%)', // App theme
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif'
  },
  contentWrapper: {
    width: '100%',
    maxWidth: '400px', // Mobile par premium look ke liye
  },
  pdfBtn: {
    width: '100%',
    marginTop: '15px',
    padding: '18px',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.4)',
    background: 'rgba(255,255,255,0.15)',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '15px',
    cursor: 'pointer',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease'
  }
};
