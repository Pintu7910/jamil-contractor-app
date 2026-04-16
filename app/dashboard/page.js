"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';

export default function WorkerDashboard() {
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hardcoded PIN 1234 use kar rahe hain
    const id = "1234"; 
    const workerRef = doc(db, "workers", id);

    const checkAndFetch = async () => {
      const docSnap = await getDoc(workerRef);
      
      // Agar document nahi hai, toh auto-create karo taaki loading khatam ho
      if (!docSnap.exists()) {
        await setDoc(workerRef, {
          name: "New Worker",
          id: id,
          totalAdvance: 0,
          totalDeducted: 0,
          wages: 500,
          status: "Offline",
          approvedAttendance: [],
          pendingAttendance: []
        });
      }

      // Live listener lagayein
      const unsub = onSnapshot(workerRef, (snap) => {
        if (snap.exists()) {
          setWorker({ id: snap.id, ...snap.data() });
          setLoading(false); // Data milte hi loading band
        }
      });
      return unsub;
    };

    checkAndFetch();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: '#764ba2', color: '#fff' }}>
      <h2>Database Se Connect Ho Raha Hai...</h2>
    </div>
  );

  return (
    <div style={styles.container}>
      <header style={{textAlign:'center', color:'#fff', marginBottom:'20px'}}>
        <h2 style={{margin:0}}>JAMIL CONTRACTOR</h2>
      </header>

      {/* 🪪 DIGITAL ID CARD */}
      <div style={styles.idCard}>
        <div style={styles.cardHeader}>
          <span>JC</span>
          <p style={{margin:0, fontSize:'10px'}}>WORKER ID CARD</p>
        </div>
        
        <div style={styles.details}>
          <h2 style={{margin:0}}>{worker.name}</h2>
          <p style={{color:'#888', fontSize:'12px'}}>WORKER ID: {worker.id}</p>
          
          <div style={styles.financeBox}>
            <div style={styles.finRow}><span>Advance:</span> <b>₹{worker.totalAdvance || 0}</b></div>
            <div style={styles.finRow}><span>Bakaya:</span> <b>₹{(worker.totalAdvance || 0) - (worker.totalDeducted || 0)}</b></div>
          </div>
        </div>
      </div>

      {/* 📸 ATTENDANCE ACTION */}
      <div style={styles.actionBox}>
        <p style={{fontSize:'14px', fontWeight:'bold'}}>Aaj Ki Attendance</p>
        <button style={styles.presentBtn}>✅ MARK PRESENT</button>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '20px', background: 'linear-gradient(135deg, #764ba2, #667eea)', minHeight: '100vh' },
  idCard: { background: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' },
  cardHeader: { background: '#764ba2', color: '#fff', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  details: { padding: '25px', textAlign: 'center' },
  financeBox: { marginTop: '20px', background: '#f8f9fa', padding: '15px', borderRadius: '12px' },
  finRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '14px' },
  actionBox: { marginTop: '30px', background: 'rgba(255,255,255,0.9)', padding: '20px', borderRadius: '20px', textAlign: 'center' },
  presentBtn: { width: '100%', padding: '15px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }
};
