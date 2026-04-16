"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { useParams } from 'next/navigation';

// 🛠️ FIX: Standard paths use karein taaki Vercel error na de
import IDCard from '@/components/IDCard';
import FinanceLedger from '@/components/FinanceLedger';
import AttendanceControl from '@/components/AttendanceControl';
import { downloadWorkerHistory } from '@/utils/pdfGenerator';

export const dynamic = 'force-dynamic';

export default function WorkerDashboard() {
  const params = useParams(); 
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🗑️ Hardcoded "1234" poori tarah delete
    const workerId = params.id; 

    if (!workerId) {
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(doc(db, "workers", workerId), (snap) => {
      if (snap.exists()) {
        setWorker({ id: snap.id, ...snap.data() });
      } else {
        console.error("Database mein worker nahi mila!");
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
      alert("Error: Attendance update failed.");
    }
  };

  if (loading) return <div style={styles.loadingScreen}>Loading...</div>;
  if (!worker) return <div style={styles.loadingScreen}>Worker Profile Not Found!</div>;

  return (
    <div style={styles.dashboardLayout}>
      <header style={styles.glassHeader}>
        <h2 style={styles.headerTitle}>MD JAMIL ANSARI</h2>
        <p style={styles.headerSub}>Worker Dashboard Control</p>
      </header>

      <div style={styles.contentWrapper}><IDCard worker={worker} /></div>
      <div style={styles.contentWrapper}>
        <AttendanceControl onMarkAttendance={handleMarkAttendance} attendanceHistory={worker.approvedAttendance} />
      </div>
      <div style={styles.contentWrapper}><FinanceLedger worker={worker} /></div>
      <div style={styles.contentWrapper}>
        <button onClick={() => downloadWorkerHistory(worker)} style={styles.glassPdfBtn}>
          📥 Download Full Record (PDF)
        </button>
      </div>
      <footer style={styles.footerText}>© 2026 Jamil Contractor System</footer>
    </div>
  );
}

const styles = {
  dashboardLayout: { padding: '20px 15px', background: 'radial-gradient(circle at top left, #8e44ad, #3498db)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' },
  loadingScreen: { background: '#764ba2', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff' },
  glassHeader: { width: '100%', maxWidth: '400px', padding: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', textAlign: 'center' },
  headerTitle: { margin: 0, color: '#fff', fontSize: '20px' },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: '11px' },
  contentWrapper: { width: '100%', maxWidth: '400px' },
  glassPdfBtn: { width: '100%', padding: '18px', borderRadius: '20px', background: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 'bold' },
  footerText: { color: 'rgba(255,255,255,0.5)', fontSize: '10px', marginTop: '20px' }
};
