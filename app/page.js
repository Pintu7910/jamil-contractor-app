"use client";
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase'; 
import { doc, getDoc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore'; // updateDoc aur arrayUnion add kiya

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

  // ✅ Naya Function: Haziri save karne ke liye
  const handleMarkAttendance = async () => {
    if (!worker) return;
    
    const today = new Date().toLocaleDateString('en-GB'); // Format: DD/MM/YYYY
    
    // Check agar aaj ki haziri pehle se hai
    const alreadyMarked = worker.approvedAttendance?.some(a => a.date === today);
    if (alreadyMarked) {
      return alert("Aaj ki haziri pehle hi lag chuki hai!");
    }

    try {
      const workerRef = doc(db, "workers", worker.id);
      await updateDoc(workerRef, {
        approvedAttendance: arrayUnion({
          date: today,
          status: "Pending" // Shuruat mein pending rahegi, admin approve karega
        })
      });
      alert("✅ Haziri bhej di gayi! Admin approve karenge.");
    } catch (err) {
      console.error(err);
      alert("Error: Haziri nahi lag payi.");
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
          <p style={{color: 'rgba(255,255,255,0.7)'}}>Workforce Management</p>
          <input 
            type="number" 
            placeholder="Enter PIN" 
            value={pin} 
            onChange={e => setPin(e.target.value.slice(0,6))} 
            style={styles.input} 
          />
          <button onClick={handleLogin} style={styles.btn}>
            {loading ? "Checking..." : "VERIFY & ENTER"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.dashboardLayout}>
       <header style={styles.header}><h2>MD JAMIL ANSARI</h2></header>
       
       {/* Pass worker aur handleMarkAttendance dono */}
       <div style={styles.box}>
          <IDCard worker={worker} onMark={handleMarkAttendance} /> 
       </div>
       
       <div style={styles.box}>
          <AttendanceControl attendanceHistory={worker?.approvedAttendance} />
       </div>
       
       <div style={styles.box}>
          <FinanceLedger worker={worker} />
       </div>
       
       <button onClick={() => downloadWorkerHistory(worker)} style={styles.pdfBtn}>📥 Download PDF</button>
    </div>
  );
}

const styles = {
  // Styles wahi hain jo pehle the...
  loginContainer: { background: 'linear-gradient(135deg, #667eea, #764ba2)', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  glassCard: { background: 'rgba(255,255,255,0.2)', padding: '40px', borderRadius: '25px', textAlign: 'center', color: 'white', width: '90%', maxWidth: '400px', border: '1px solid rgba(255,255,255,0.3)' },
  input: { width: '100%', padding: '15px', borderRadius: '10px', border: 'none', marginBottom: '20px', textAlign: 'center', fontSize: '20px', color: '#000' },
  btn: { width: '100%', padding: '15px', borderRadius: '10px', border: 'none', background: '#fff', color: '#667eea', fontWeight: 'bold', cursor: 'pointer' },
  logo: { width: '60px', height: '60px', background: 'rgba(255,255,255,0.3)', borderRadius: '50%', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#fff' },
  dashboardLayout: { padding: '20px', background: 'linear-gradient(#8e44ad, #3498db)', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' },
  header: { color: '#fff', marginBottom: '10px' },
  box: { width: '100%', maxWidth: '400px' },
  pdfBtn: { width: '100%', maxWidth: '400px', padding: '15px', borderRadius: '15px', background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid #fff', cursor: 'pointer', fontWeight: 'bold' }
};
