"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { useParams } from 'next/navigation';

// ✅ Fix: Yahan humne '@/' use kiya hai taaki rasta sahi mile
import IDCard from '@/components/IDCard';
import FinanceLedger from '@/components/FinanceLedger';
import AttendanceControl from '@/components/AttendanceControl';
import { downloadWorkerHistory } from '@/utils/pdfGenerator';

export const dynamic = 'force-dynamic';

export default function Dashboard() {
  const params = useParams(); 
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const workerId = params.id; 
    if (!workerId) {
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(doc(db, "workers", workerId), (snap) => {
      if (snap.exists()) {
        setWorker({ id: snap.id, ...snap.data() });
      } else {
        console.error("Worker data missing in Firestore");
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
      alert("⚠️ Attendance all ready saved!");
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
      alert("✅ Attendance sucessfull!");
    } catch (error) {
      alert("Error: Attendance failed.");
    }
  };

  if (loading) return <div style={styles.loadingScreen}>Loading...</div>;
  if (!worker) return <div style={styles.loadingScreen}>Worker Not Found!</div>;

  return (
    <div style={styles.dashboardLayout}>
      <header style={styles.glassHeader}>
        <h2 style={styles.headerTitle}>MD JAMIL ANSARI</h2>
        <p style={styles.headerSub}>Admin Control Dashboard</p>
      </header>

      <div style={styles.contentWrapper}><IDCard worker={worker} /></div>
      <div style={styles.contentWrapper}>
        <AttendanceControl onMarkAttendance={handleMarkAttendance} attendanceHistory={worker.approvedAttendance} />
      </div>
      <div style={styles.contentWrapper}><FinanceLedger worker={worker} /></div>
      <div style={styles.contentWrapper}>
        <button onClick={() => downloadWorkerHistory(worker)} style={styles.glassPdfBtn}>
          📥 Download PDF Record
        </button>
      </div>
    </div>
  );
}

const styles = {
  dashboardLayout: { padding: '20px 15px', background: 'linear-gradient(#8e44ad, #3498db)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' },
  loadingScreen: { background: '#764ba2', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff' },
  glassHeader: { width: '100%', maxWidth: '400px', padding: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', textAlign: 'center' },
  headerTitle: { margin: 0, color: '#fff', fontSize: '20px' },
  headerSub: { color: 'rgba(255,255,255,0.7)', fontSize: '11px' },
  contentWrapper: { width: '100%', maxWidth: '400px' },
  glassPdfBtn: { width: '100%', padding: '18px', borderRadius: '20px', background: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 'bold' }
};
