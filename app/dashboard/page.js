"use client";
import { useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';

export default function WorkerDashboard() {
  const [worker, setWorker] = useState(null);
  const [pin, setPin] = useState(''); // 4-digit Identification Number
  const [isVerified, setIsVerified] = useState(false);

  const verifyWorker = async () => {
    if (pin.length !== 4) return alert("Khaali 4-digit ka number daalein!");
    
    // Admin dwara diya gaya 4-digit number hi document ID hogi
    const docRef = doc(db, "workers", pin); 
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      setWorker({ id: docSnap.id, ...docSnap.data() });
      setIsVerified(true);
    } else {
      alert("Ghalat Number! Admin se sahi number maangein.");
    }
  };

  const markAttendance = async (status) => {
    const workerRef = doc(db, "workers", worker.id);
    const log = {
      status,
      time: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString(),
    };
    await updateDoc(workerRef, {
      currentStatus: status,
      attendanceHistory: arrayUnion(log)
    });
    alert(`${status} update ho gaya!`);
  };

  if (!isVerified) return (
    <div style={container}>
      <div style={glassCard}>
        <h2>MD Jamil Ansari</h2>
        <p>Apna 4-digit number bhariye</p>
        <input 
          type="number" 
          placeholder="0 0 0 0" 
          onChange={(e) => setPin(e.target.value)} 
          style={pinInput} 
        />
        <button onClick={verifyWorker} style={btn}>Verify & Start</button>
      </div>
    </div>
  );

  return (
    <div style={container}>
      <div style={glassCard}>
        <h3>Worker: {worker.name}</h3>
        <div style={{display:'grid', gap:'15px'}}>
          <button onClick={() => markAttendance("Working")} style={{...btn, background:'#22c55e'}}>Kaam Shuru (9-5)</button>
          <button onClick={() => markAttendance("Relaxing")} style={{...btn, background:'#eab308'}}>Aaram (Break)</button>
          <button onClick={() => markAttendance("Out")} style={{...btn, background:'#ef4444'}}>Site se Bahar</button>
        </div>
      </div>
    </div>
  );
}

// Styling (Mobile Friendly)
const container = { background: 'linear-gradient(135deg, #667eea, #764ba2)', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' };
const glassCard = { background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', padding: '30px', borderRadius: '20px', color: 'white', textAlign:'center', width:'100%', maxWidth:'400px' };
const pinInput = { width: '80%', padding: '15px', fontSize: '24px', textAlign: 'center', letterSpacing: '10px', borderRadius: '10px', border: 'none', marginBottom: '20px' };
const btn = { width: '100%', padding: '15px', borderRadius: '10px', border: 'none', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer' };
