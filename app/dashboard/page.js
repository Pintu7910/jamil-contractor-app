"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';

export default function WorkerDashboard() {
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Check local storage first, default to '1234'
    const id = localStorage.getItem("workerID") || "1234"; 
    
    const workerRef = doc(db, "workers", id);

    // 2. Real-time listener with Error Handling
    const unsub = onSnapshot(workerRef, (docSnap) => {
      if (docSnap.exists()) {
        setWorker({ id: docSnap.id, ...docSnap.data() });
        setError(null);
      } else {
        setError("Worker ID '1234' database mein nahi mili. Admin se register karwayein.");
      }
      setLoading(false);
    }, (err) => {
      console.error("Firebase Error:", err);
      setError("Database connection error. Rules check karein.");
    });

    return () => unsub();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: '#764ba2', color: '#fff' }}>
      <h2>Loading Worker Data...</h2>
    </div>
  );

  if (error) return (
    <div style={{ padding: '20px', textAlign: 'center', color: 'red', marginTop: '100px' }}>
      <h3>Oops! Problem Aa Gayi</h3>
      <p>{error}</p>
      <button onClick={() => window.location.reload()} style={{padding:'10px', marginTop:'10px'}}>Refresh Karein</button>
    </div>
  );

  return (
    <div style={styles.container}>
       {/* 🪪 ID CARD SECTION */}
       <div style={styles.idCard}>
        <div style={styles.cardHeader}>
          <span>JC</span>
          <div style={{textAlign:'right'}}>
            <h4 style={{margin:0}}>JAMIL CONTRACTOR</h4>
          </div>
        </div>
        <div style={styles.details}>
          <h2 style={{margin:0}}>{worker.name || "Worker Name"}</h2>
          <p>ID NO: {worker.id}</p>
          <div style={styles.ledger}>
             <p>Advance: ₹{worker.totalAdvance || 0}</p>
             <p>Bakaya: ₹{(worker.totalAdvance || 0) - (worker.totalDeducted || 0)}</p>
          </div>
        </div>
      </div>
      
      {/* Attendance Button */}
      <div style={styles.actionBox}>
         <button style={styles.presentBtn}>✅ MARK PRESENT</button>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '20px', background: 'linear-gradient(135deg, #764ba2, #667eea)', minHeight: '100vh' },
  idCard: { background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' },
  cardHeader: { background: '#764ba2', color: '#fff', padding: '15px', display: 'flex', justifyContent: 'space-between' },
  details: { padding: '20px', textAlign: 'center' },
  ledger: { background: '#f8f9fa', padding: '15px', borderRadius: '10px', marginTop: '10px' },
  actionBox: { marginTop: '20px', textAlign: 'center' },
  presentBtn: { width: '100%', padding: '15px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold' }
};
