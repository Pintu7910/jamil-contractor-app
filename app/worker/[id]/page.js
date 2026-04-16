"use client";
import { useState, useEffect } from 'react';
import { db } from '../../../lib/firebase'; // ✅ Direct Path
import { doc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { useParams } from 'next/navigation';

// ✅ Direct relative paths use kiye hain
import IDCard from '../../../components/IDCard';
import FinanceLedger from '../../../components/FinanceLedger';
import AttendanceControl from '../../../components/AttendanceControl';
import { downloadWorkerHistory } from '../../../utils/pdfGenerator';

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
    const unsub = onSnapshot(doc(db, "workers", workerId), (snap) => {
      if (snap.exists()) {
        setWorker({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    });
    return () => unsub();
  }, [params.id]);

  const handleMarkAttendance = async () => {
    if (!worker) return;
    const today = new Date().toLocaleDateString('en-GB');
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
      alert("✅ Attendance successful!");
    } catch (error) {
      alert("Error saving attendance.");
    }
  };

  if (loading) return (
    <div style={{background: '#764ba2', height: '100vh', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
      <h3>Loading...</h3>
    </div>
  );
  
  if (!worker) return (
    <div style={{background: '#764ba2', height: '100vh', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
      Worker Record Not Found!
    </div>
  );

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
        <button onClick={() => downloadWorkerHistory(worker)} style={styles.glassPdfBtn}>📥 Download PDF</button>
      </div>
    </div>
  );
}

const styles = {
  dashboardLayout: { padding: '20px 15px', background: 'radial-gradient(circle at top left, #8e44ad, #3498db)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' },
  glassHeader: { width: '100%', maxWidth: '400px', padding: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.2)' },
  headerTitle: { margin: 0, color: '#fff', fontSize: '20px' },
  headerSub: { margin: '5px 0 0', color: 'rgba(255,255,255,0.7)', fontSize: '11px' },
  contentWrapper: { width: '100%', maxWidth: '400px' },
  glassPdfBtn: { width: '100%', padding: '18px', borderRadius: '20px', background: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 'bold', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer' }
};
