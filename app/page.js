"use client";
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase'; 
import { doc, getDoc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';

// ✅ Sahi rasta: page.js 'app' mein hai, components bahar hain
import IDCard from '../components/IDCard';
import FinanceLedger from '../components/FinanceLedger';
import AttendanceControl from '../components/AttendanceControl';
import { downloadWorkerHistory } from '../utils/pdfGenerator';

export default function App() {
  const [pin, setPin] = useState('');
  const [worker, setWorker] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  // 1. Check if already logged in
  useEffect(() => {
    const savedID = localStorage.getItem("workerID");
    if (savedID) {
      loadWorkerData(savedID);
    }
  }, []);

  // 2. Load Worker Data
  const loadWorkerData = (id) => {
    setLoading(true);
    const unsub = onSnapshot(doc(db, "workers", id), (snap) => {
      if (snap.exists()) {
        setWorker({ id: snap.id, ...snap.data() });
        setIsLoggedIn(true);
      } else {
        localStorage.removeItem("workerID");
        setIsLoggedIn(false);
      }
      setLoading(false);
    });
    return () => unsub();
  };

  // 3. Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    if (pin.length < 4) return alert("Sahi PIN daalein");
    setLoading(true);

    try {
      const docSnap = await getDoc(doc(db, "workers", pin));
      if (docSnap.exists()) {
        localStorage.setItem("workerID", pin);
        loadWorkerData(pin);
      } else {
        alert("Ghalat PIN!");
      }
    } catch (err) {
      alert("Network Error!");
    }
    setLoading(false);
  };

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

  // --- LOGIN SCREEN ---
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

  // --- DASHBOARD SCREEN ---
  if (loading && !worker) return <div style={styles.loading}>Loading Dashboard...</div>;

  return (
    <div style={styles.dashboardLayout}>
      <header style={styles.glassHeader}>
        <h2 style={{margin:0, color: '#fff'}}>MD JAMIL ANSARI</h2>
        <button 
          onClick={() => {localStorage.removeItem("workerID"); window.location.reload();}} 
          style={styles.logoutBtn}>Logout</button>
      </header>

      <div style={styles.contentWrapper}><IDCard worker={worker} /></div>
      <div style={styles.contentWrapper}>
        <AttendanceControl onMarkAttendance={handleMarkAttendance} attendanceHistory={worker?.approvedAttendance} />
      </div>
      <div style={styles.contentWrapper}><FinanceLedger worker={worker} /></div>
      <div style={styles.contentWrapper}>
        <button onClick={() => downloadWorkerHistory(worker)} style={styles.glassPdfBtn}>📥 Download PDF</button>
      </div>
    </div>
  );
}

const styles = {
  loginContainer: { background: 'linear-gradient(135deg, #667eea, #764ba2)', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  glassCard: { background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', padding: '40px', borderRadius: '25px', textAlign: 'center', width: '90%', maxWidth: '400px', border: '1px solid rgba(255,255,255,0.3)' },
  input: { width: '100%', padding: '15px', fontSize: '20px', textAlign: 'center', borderRadius: '10px', border: 'none', marginBottom: '20px', outline: 'none' },
  btn: { width: '100%', padding: '15px', borderRadius: '10px', border: 'none', background: '#fff', color: '#667eea', fontWeight: 'bold', cursor: 'pointer' },
  logo: { width: '70px', height: '70px', background: 'rgba(255,255,255,0.3)', borderRadius: '50%', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: '#fff' },
  dashboardLayout: { padding: '20px 15px', background: 'linear-gradient(#8e44ad, #3498db)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' },
  glassHeader: { width: '100%', maxWidth: '400px', padding: '15px', background: 'rgba(255,255,255,0.1)', borderRadius: '15px', textAlign: 'center' },
  logoutBtn: { background: 'none', border: '1px solid #fff', color: '#fff', padding: '5px 10px', borderRadius: '5px', marginTop: '10px', cursor: 'pointer', fontSize: '12px' },
  contentWrapper: { width: '100%', maxWidth: '400px' },
  glassPdfBtn: { width: '100%', padding: '18px', borderRadius: '20px', background: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 'bold', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer' },
  loading: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#764ba2', color: '#fff' }
};
