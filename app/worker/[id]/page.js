"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { useParams } from 'next/navigation';

// ✅ Fix: Next.js standard paths (@/) use karein
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
    const workerId = params.id; 
    if (!workerId) {
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(doc(db, "workers", workerId), (snap) => {
      if (snap.exists()) {
        setWorker({ id: snap.id, ...snap.data() });
      } else {
        console.error("Worker nahi mila!");
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
      alert("Error: Update failed.");
    }
  };

  if (loading) return <div style={{background: '#764ba2', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff'}}>Loading...</div>;
  if (!worker) return <div style={{background: '#764ba2', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff'}}>Worker Not Found!</div>;

  return (
    <div style={{padding: '20px 15px', background: 'radial-gradient(circle at top left, #8e44ad, #3498db)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px'}}>
      <header style={{width: '100%', maxWidth: '400px', padding: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', textAlign: 'center'}}>
        <h2 style={{margin: 0, color: '#fff'}}>MD JAMIL ANSARI</h2>
      </header>
      <div style={{width: '100%', maxWidth: '400px'}}><IDCard worker={worker} /></div>
      <div style={{width: '100%', maxWidth: '400px'}}><AttendanceControl onMarkAttendance={handleMarkAttendance} attendanceHistory={worker.approvedAttendance} /></div>
      <div style={{width: '100%', maxWidth: '400px'}}><FinanceLedger worker={worker} /></div>
      <div style={{width: '100%', maxWidth: '400px'}}>
        <button onClick={() => downloadWorkerHistory(worker)} style={{width: '100%', padding: '18px', borderRadius: '20px', background: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 'bold'}}>📥 Download PDF</button>
      </div>
    </div>
  );
}
