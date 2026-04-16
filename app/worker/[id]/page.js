"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { useParams } from 'next/navigation';

// ✅ Relative Paths (Folder ke hisaab se sahi rasta)
import IDCard from '../../components/IDCard';
import FinanceLedger from '../../components/FinanceLedger';
import AttendanceControl from '../../components/AttendanceControl';
import { downloadWorkerHistory } from '../../utils/pdfGenerator';

// ✅ Ye line Vercel build error (generateStaticParams) ko fix karegi
export const dynamic = 'force-dynamic';

export default function WorkerDashboard() {
  const params = useParams(); 
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const workerId = params.id; 

    if (!workerId) {
      setLoading(false);
      return;
    }

    // Real-time sync specific worker ke liye
    const unsub = onSnapshot(doc(db, "workers", workerId), (snap) => {
      if (snap.exists()) {
        setWorker({ id: snap.id, ...snap.data() });
      } else {
        console.error("Worker data not found in Firebase!");
      }
      setLoading(false);
    });

    return () => unsub();
  }, [params.id]);

  const handleMarkAttendance = async () => {
    if (!worker) return;

    const today = new Date().toLocaleDateString('en-GB');
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
          status: "Approved" 
        }),
        status: "Online"
      });
      alert("✅ Haziri lag gayi!");
    } catch (error) {
      alert("Error: Database update failed.");
    }
  };

  if (loading) return (
    <div style={styles.loadingScreen}>
      <div style={styles.glassLoader}>
        <h3 style={{margin:0}}>JAMIL CONTRACTOR</h3>
        <p style={{fontSize:'12px', opacity:0.6}}>Loading Dashboard...</p>
      </div>
    </div>
  );

  if (!worker) return <div style={styles.loadingScreen}>Worker Profile Not Found!</div>;

  return (
    <div style={styles.dashboardLayout}>
      <header style={styles.glassHeader}>
        <h2 style={styles.headerTitle}>MD JAMIL ANSARI</h2>
        <p style={styles.headerSub}>Worker Dashboard Control</p>
      </header>

      <div style={styles.contentWrapper}>
        <IDCard worker={worker} />
      </div>

      <div style={styles.contentWrapper}>
        <AttendanceControl 
          onMarkAttendance={handleMarkAttendance} 
          attendanceHistory={worker.approvedAttendance} 
        />
      </div>

      {/* 💰 Finance Ledger Section */}
      <div style={styles.contentWrapper}>
        <FinanceLedger worker={worker} />
      </div>

      <div style={styles.contentWrapper}>
        <button onClick={() => downloadWorkerHistory(worker)} style={styles.glassPdfBtn}>
          📥 Download Full Record (PDF)
        </button>
      </div>

      <footer style={styles.footerText}>
        © 2026 Jamil Contractor System | Jamshedpur
      </footer>
    </div>
  );
}

const styles = {
  dashboardLayout: {
    padding: '20px 15px',
    background: 'radial-gradient(circle at top left, #8e44ad, #3498db)', 
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px',
    fontFamily: '"Segoe UI", sans-serif'
  },
  loadingScreen: {
    background: '#764ba2',
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#fff'
  },
  glassLoader: {
    padding: '30px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    textAlign: 'center'
  },
  glassHeader: {
    width: '100%',
    maxWidth: '400px',
    padding: '20px',
    background: 'rgba(255, 255, 255, 0.1)', 
    borderRadius: '20px',
    backdropFilter: 'blur(15px)', 
    border: '1px solid rgba(255, 255, 255, 0.2)',
    textAlign: 'center',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.2)'
  },
  headerTitle: { margin: 0, color: '#fff', fontSize: '20px', fontWeight: '800' },
  headerSub: { margin: '5px 0 0', color: 'rgba(255,255,255,0.7)', fontSize: '11px' },
  contentWrapper: {
    width: '100%',
    maxWidth: '400px',
  },
  glassPdfBtn: {
    width: '100%',
    padding: '18px',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    background: 'rgba(255, 255, 255, 0.15)',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '14px',
    cursor: 'pointer',
    backdropFilter: 'blur(10px)',
    transition: '0.3s ease',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
  },
  footerText: {
    textAlign: 'center', 
    color: 'rgba(255,255,255,0.5)', 
    fontSize: '10px', 
    marginTop: '20px'
  }
};
