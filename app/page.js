"use client";
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase'; 
import { doc, getDoc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';

import IDCard from './components/IDCard';
import FinanceLedger from './components/FinanceLedger';
import AttendanceControl from './components/AttendanceControl';
import { downloadWorkerHistory } from './utils/pdfGenerator'; 

export default function MainApp() {
  const [pin, setPin] = useState('');
  const [worker, setWorker] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedID = localStorage.getItem("workerID");
    if (savedID) loadWorker(savedID);
  }, []);

  const loadWorker = (id) => {
    setLoading(true);
    const unsub = onSnapshot(doc(db, "workers", id), (snap) => {
      if (snap.exists()) {
        setWorker({ id: snap.id, ...snap.data() });
        setIsLoggedIn(true);
      }
      setLoading(false);
    });
    return () => unsub();
  };

  // ✅ Yahi wo function hai jo haziri lagayega
  const handleMarkAttendance = async () => {
    if (!worker) return;
    
    const today = new Date().toLocaleDateString('en-GB'); 
    const alreadyMarked = worker.approvedAttendance?.some(a => a.date === today);

    if (alreadyMarked) {
      alert("⚠️ Aaj ki haziri pehle hi lag chuki hai!");
      return;
    }

    try {
      const workerRef = doc(db, "workers", worker.id);
      await updateDoc(workerRef, {
        approvedAttendance: arrayUnion({
          date: today,
          status: "Pending" 
        })
      });
      alert("✅ Haziri lag gayi! Admin approve karenge.");
    } catch (err) {
      alert("❌ Error: " + err.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (pin.length < 4) return alert("Sahi PIN daalein");
    setLoading(true);
    try {
      const docSnap = await getDoc(doc(db, "workers", pin));
      if (docSnap.exists()) {
        localStorage.setItem("workerID", pin);
        loadWorker(pin);
      } else { alert("Ghalat PIN!"); }
    } catch (err) { alert("Network Error!"); }
    setLoading(false);
  };

  if (!isLoggedIn) {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.glassCard}>
          <div style={styles.logo}>MJ</div>
          <h2 style={{color: '#fff'}}>MD JAMIL ANSARI</h2>
          <input type="number" placeholder="Enter PIN" value={pin} onChange={e => setPin(e.target.value.slice(0,6))} style={styles.input} />
          <button onClick={handleLogin} style={styles.btn}>{loading ? "Checking..." : "VERIFY & ENTER"}</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.dashboardLayout}>
       <header style={styles.header}><h2>MD JAMIL ANSARI</h2></header>
       
       {/* ⚠️ Sabse zaroori: onMark prop yahan pass kiya gaya hai */}
       <div style={styles.box}>
          <IDCard worker={worker} onMark={handleMarkAttendance} /> 
       </div>
       
       <div style={styles.box}><AttendanceControl attendanceHistory={worker?.approvedAttendance} /></div>
       <div style={styles.box}><FinanceLedger worker={worker} /></div>
       <button onClick={() => downloadWorkerHistory(worker)} style={styles.pdfBtn}>📥 Download PDF</button>
    </div>
  );
}

const styles = {
  loginContainer: { background: 'linear-gradient(135deg, #667eea, #764ba2)', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  glassCard: { background: 'rgba(255,255,255,0.2)', padding: '40px', borderRadius: '25px', textAlign: 'center', color: 'white', width: '90%', maxWidth: '400px' },
  input: { width: '100%', padding: '15px', borderRadius: '10px', border: 'none', marginBottom: '20px', textAlign: 'center', fontSize: '20px' },
  btn: { width: '100%', padding: '15px', borderRadius: '10px', border: 'none', background: '#fff', color: '#667eea', fontWeight: 'bold', cursor: 'pointer' },
  dashboardLayout: { padding: '20px', background: 'linear-gradient(#8e44ad, #3498db)', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' },
  header: { color: '#fff', marginBottom: '10px' },
  box: { width: '100%', maxWidth: '400px' },
  pdfBtn: { width: '100%', maxWidth: '400px', padding: '15px', borderRadius: '15px', background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid #fff', marginTop: '10px' }
};
