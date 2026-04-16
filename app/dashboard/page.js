"use client";
import { useState, useEffect } from 'react';
// ✅ Level 2 paths (../../) ab sahi se milenge
import { db } from '../../lib/firebase'; 
import { doc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';

// ✅ Components paths simple ho gaye
import IDCard from '../../components/IDCard';
import FinanceLedger from '../../components/FinanceLedger';
import AttendanceControl from '../../components/AttendanceControl';
import { downloadWorkerHistory } from '../../utils/pdfGenerator';

export const dynamic = 'force-dynamic';

export default function Dashboard() {
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔍 Yahan apni fixed Worker ID daal dein (Jaise 4168)
    const workerId = "4168"; 

    const unsub = onSnapshot(doc(db, "workers", workerId), (snap) => {
      if (snap.exists()) {
        setWorker({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

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
      alert("✅ Attendance Successful!");
    } catch (error) {
      alert("Error saving attendance.");
    }
  };

  if (loading) return (
    <div style={{background: '#764ba2', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff'}}>
       <h3>Loading...</h3>
    </div>
  );

  return (
    <div style={styles.dashboardLayout}>
      <header style={styles.glassHeader}>
        <h2 style={styles.headerTitle}>MD JAMIL ANSARI</h2>
      </header>

      <div style={styles.contentWrapper}><IDCard worker={worker} /></div>
      <div style={styles.contentWrapper}>
        <AttendanceControl onMarkAttendance={handleMarkAttendance} attendanceHistory={worker.approvedAttendance} />
      </div>
      <div style={styles.contentWrapper}><FinanceLedger worker={worker} /></div>
      <div style={styles.contentWrapper}>
        <button onClick={() => downloadWorkerHistory(worker)} style={styles.glassPdfBtn}>
          📥 Download PDF
        </button>
      </div>
    </div>
  );
}

const styles = {
  dashboardLayout: { padding: '20px 15px', background: 'linear-gradient(#8e44ad, #3498db)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' },
  glassHeader: { width: '100%', maxWidth: '400px', padding: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', textAlign: 'center' },
  headerTitle: { margin: 0, color: '#fff', fontSize: '20px' },
  contentWrapper: { width: '100%', maxWidth: '400px' },
  glassPdfBtn: { width: '100%', padding: '18px', borderRadius: '20px', background: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }
};
