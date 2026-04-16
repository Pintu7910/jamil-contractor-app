"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function WorkerDashboard() {
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const workerID = "1234"; // Aapka hardcoded PIN
    const unsub = onSnapshot(doc(db, "workers", workerID), (snap) => {
      if (snap.exists()) {
        setWorker({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return <div style={styles.loading}>Loading Worker Data...</div>;

  if (!worker) return (
    <div style={styles.error}>
      <h3>Oops! Worker Not Found</h3>
      <p>ID '1234' database mein nahi hai.</p>
      <p>Pehle Admin Panel se register karein.</p>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.idCard}>
        <div style={styles.header}>
          <span>JC</span>
          <p>JAMIL CONTRACTOR</p>
        </div>
        <div style={styles.body}>
          <h2>{worker.name}</h2>
          <p>ID: {worker.id}</p>
          <div style={styles.ledger}>
            <p>Advance: ₹{worker.totalAdvance || 0}</p>
            <p>Baki: ₹{(worker.totalAdvance || 0) - (worker.totalDeducted || 0)}</p>
          </div>
        </div>
      </div>
      <div style={styles.attendanceBox}>
        <button style={styles.btn}>📸 Mark Present</button>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '20px', background: 'linear-gradient(135deg, #764ba2, #667eea)', minHeight: '100vh' },
  loading: { display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', color: '#fff', fontSize: '20px' },
  error: { padding: '50px', textAlign: 'center', color: 'red', background: '#fff', minHeight: '100vh' },
  idCard: { background: '#fff', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' },
  header: { background: '#764ba2', color: '#fff', padding: '15px', display: 'flex', justifyContent: 'space-between' },
  body: { padding: '20px', textAlign: 'center' },
  ledger: { background: '#f8f9fa', padding: '10px', borderRadius: '8px', marginTop: '10px' },
  attendanceBox: { marginTop: '20px', textAlign: 'center' },
  btn: { width: '100%', padding: '15px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold' }
};
