"use client";
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase'; 
import { doc, getDoc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';

// ✅ Sahi rasta: page.js 'app' mein hai, components uske bahar
import IDCard from '../components/IDCard';
import FinanceLedger from '../components/FinanceLedger';
import AttendanceControl from '../components/AttendanceControl';
import { downloadWorkerHistory } from '../utils/pdfGenerator';

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

  const handleLogin = async (e) => {
    e.preventDefault();
    if (pin.length < 4) return alert("PIN daalein");
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
      <div style={{background: 'linear-gradient(135deg, #667eea, #764ba2)', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff'}}>
        <div style={{background: 'rgba(255,255,255,0.2)', padding: '40px', borderRadius: '25px', textAlign: 'center', width: '90%', maxWidth: '400px'}}>
          <div style={{width: '70px', height: '70px', background: 'rgba(255,255,255,0.3)', borderRadius: '50%', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px'}}>MJ</div>
          <h2>MD JAMIL ANSARI</h2>
          <p>Workforce Management</p>
          <input type="number" placeholder="Enter PIN" value={pin} onChange={e => setPin(e.target.value.slice(0,6))} style={{width: '100%', padding: '15px', fontSize: '20px', textAlign: 'center', borderRadius: '10px', border: 'none', marginBottom: '20px', color: '#333'}} />
          <button onClick={handleLogin} style={{width: '100%', padding: '15px', borderRadius: '10px', border: 'none', background: '#fff', color: '#667eea', fontWeight: 'bold'}}>{loading ? "Checking..." : "VERIFY & ENTER"}</button>
        </div>
      </div>
    );
  }

  if (loading && !worker) return <div style={{height:'100vh', background:'#764ba2', display:'flex', justifyContent:'center', alignItems:'center', color:'#fff'}}>Loading...</div>;

  return (
    <div style={{padding: '20px 15px', background: 'linear-gradient(#8e44ad, #3498db)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px'}}>
      <header style={{width: '100%', maxWidth: '400px', padding: '15px', background: 'rgba(255,255,255,0.1)', borderRadius: '15px', textAlign: 'center', color: '#fff'}}>
        <h2 style={{margin:0}}>MD JAMIL ANSARI</h2>
      </header>
      <div style={{width: '100%', maxWidth: '400px'}}><IDCard worker={worker} /></div>
      <div style={{width: '100%', maxWidth: '400px'}}><AttendanceControl attendanceHistory={worker?.approvedAttendance} /></div>
      <div style={{width: '100%', maxWidth: '400px'}}><FinanceLedger worker={worker} /></div>
      <div style={{width: '100%', maxWidth: '400px'}}>
        <button onClick={() => downloadWorkerHistory(worker)} style={{width: '100%', padding: '18px', borderRadius: '20px', background: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 'bold', border: 'none'}}>📥 Download PDF</button>
      </div>
    </div>
  );
}
