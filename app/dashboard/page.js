"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function WorkerDashboard() {
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState(null);

  useEffect(() => {
    // 1234 hardcoded PIN for initial entry as per your requirement
    const id = localStorage.getItem("workerID") || "1234"; 
    
    const unsub = onSnapshot(doc(db, "workers", id), (docSnap) => {
      if (docSnap.exists()) {
        setWorker({ id: docSnap.id, ...docSnap.data() });
      } else {
        console.error("Worker data not found!");
      }
      setLoading(false); // Data milte hi loading khatam
    });

    return () => unsub();
  }, []);

  // Blank screen se bachne ke liye loading spinner
  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', background: '#764ba2', color: '#fff' }}>
        <h2>Loading Worker Data...</h2>
      </div>
    );
  }

  // Agar phir bhi worker data na mile toh login par wapas bhejien
  if (!worker) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <p>Worker data not found. Please login again.</p>
        <button onClick={() => window.location.href = "/"}>Back to Login</button>
      </div>
    );
  }

  const handleMarkPresent = async () => {
    if (!image) return alert("Pehle Photo Capture karein!");
    const workerRef = doc(db, "workers", worker.id);
    const now = new Date();
    
    await updateDoc(workerRef, {
      pendingAttendance: arrayUnion({
        date: now.toLocaleDateString(),
        time: now.toLocaleTimeString(),
        photo: image,
        status: "Pending"
      })
    });
    setImage(null);
    alert("Attendance sent to Admin!");
  };

  return (
    <div style={styles.container}>
      <header style={{color: '#fff', textAlign: 'center'}}>
        <h1 style={{margin:0}}>MD JAMIL ANSARI</h1>
        <p>Worker Dashboard</p>
      </header>

      {/* 🪪 ID CARD SECTION */}
      <div style={styles.idCard}>
        <div style={styles.cardHeader}>
          <span>JC</span>
          <div style={{textAlign:'right'}}>
            <h4 style={{margin:0}}>JAMIL CONTRACTOR</h4>
          </div>
        </div>
        <div style={styles.details}>
          <h2 style={{margin:0}}>{worker.name}</h2>
          <p>ID: {worker.id}</p>
          <div style={styles.financeGrid}>
            <div style={styles.finBox}><span>Advance</span><br/><b>₹{worker.totalAdvance || 0}</b></div>
            <div style={styles.finBox}><span>Baki</span><br/><b>₹{(worker.totalAdvance || 0) - (worker.totalDeducted || 0)}</b></div>
          </div>
        </div>
      </div>

      {/* 📸 ATTENDANCE ACTION */}
      <div style={styles.actionCard}>
        <h3>Attendance Approval</h3>
        <input type="file" accept="image/*" capture="camera" onChange={(e) => {
          const reader = new FileReader();
          reader.onload = (ev) => setImage(ev.target.result);
          reader.readAsDataURL(e.target.files[0]);
        }} />
        <button onClick={handleMarkPresent} style={styles.presentBtn}>✅ Mark Present</button>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '20px', background: 'linear-gradient(135deg, #764ba2, #667eea)', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '20px' },
  idCard: { background: '#fff', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 5px 15px rgba(0,0,0,0.2)' },
  cardHeader: { background: '#764ba2', color: '#fff', padding: '10px 15px', display: 'flex', justifyContent: 'space-between' },
  details: { padding: '20px', textAlign: 'center' },
  financeGrid: { display: 'flex', justifyContent: 'space-around', marginTop: '10px', background: '#f0f0f0', padding: '10px', borderRadius: '8px' },
  actionCard: { background: '#fff', padding: '20px', borderRadius: '15px', textAlign: 'center' },
  presentBtn: { width: '100%', padding: '10px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '5px', marginTop: '10px', fontWeight: 'bold' }
};
