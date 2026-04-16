"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, setDoc, arrayUnion, increment, collection, getDocs } from 'firebase/firestore';

export default function AdminPanel() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pin, setPin] = useState('');
  const [worker, setWorker] = useState(null);
  const [amount, setAmount] = useState('');
  const [dailyWage, setDailyWage] = useState('');
  const [loading, setLoading] = useState(true);

  // Registration States
  const [newName, setNewName] = useState('');
  const [newPhoto, setNewPhoto] = useState('');

  const targetWorkerId = "1234"; 

  useEffect(() => {
    if (isAuthorized) {
      const unsub = onSnapshot(doc(db, "workers", targetWorkerId), (snap) => {
        if (snap.exists()) {
          setWorker({ id: snap.id, ...snap.data() });
          setDailyWage(snap.data().dailyWage || '');
        }
        setLoading(false);
      });
      return () => unsub();
    }
  }, [isAuthorized]);

  // 1. PIN Check (832300)
  const handlePinSubmit = () => {
    if (pin === "832300") {
      setIsAuthorized(true);
    } else {
      alert("❌ Galat PIN! Jamshedpur code sahi se dalein.");
    }
  };

  // 2. Auto 4-Digit ID Generation & Worker Registration
  const handleRegisterWorker = async () => {
    if (!newName) return alert("Naam likhna zaroori hai!");
    
    // Auto Generate 4 Digit ID (e.g., 5021)
    const newId = Math.floor(1000 + Math.random() * 9000).toString();
    
    try {
      await setDoc(doc(db, "workers", newId), {
        name: newName,
        photo: newPhoto || "https://via.placeholder.com/150",
        dailyWage: 0,
        totalAdvance: 0,
        totalDeducted: 0,
        approvedAttendance: [],
        advanceHistory: [],
        deductionHistory: [],
        status: "Offline",
        createdAt: new Date().toISOString()
      });
      alert(`✅ Worker Registered! ID: ${newId}`);
      setNewName(''); setNewPhoto('');
    } catch (e) {
      alert("Registration failed!");
    }
  };

  // Finance Functions (Same as before)
  const updateWage = async () => {
    await updateDoc(doc(db, "workers", targetWorkerId), { dailyWage: Number(dailyWage) });
    alert("✅ Dihadi Updated!");
  };

  const addFinance = async (type) => {
    if (!amount) return alert("Rakam bhariye!");
    const ref = doc(db, "workers", targetWorkerId);
    const date = new Date().toLocaleDateString('en-GB');
    const updateData = type === 'adv' 
      ? { totalAdvance: increment(Number(amount)), advanceHistory: arrayUnion({ date, amount: Number(amount) }) }
      : { totalDeducted: increment(Number(amount)), deductionHistory: arrayUnion({ date, amount: Number(amount) }) };
    
    await updateDoc(ref, updateData);
    setAmount('');
    alert("✅ Entry Successful!");
  };

  if (!isAuthorized) {
    return (
      <div style={styles.loginOverlay}>
        <div style={styles.loginBox}>
          <h2>🔐 Admin Access</h2>
          <p>Enter Area PIN to Continue</p>
          <input 
            type="password" 
            placeholder="Enter PIN" 
            value={pin} 
            onChange={(e) => setPin(e.target.value)} 
            style={styles.input}
          />
          <button onClick={handlePinSubmit} style={styles.loginBtn}>Unlock Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.adminContainer}>
      <h1 style={styles.title}>JAMIL CONTRACTOR - CONTROL CENTER</h1>
      
      {/* 📝 SECTION 1: REGISTER NEW WORKER */}
      <div style={styles.card}>
        <h3 style={{marginTop:0}}>🆕 Register New Worker</h3>
        <input 
          type="text" placeholder="Worker Full Name" 
          value={newName} onChange={(e) => setNewName(e.target.value)} 
          style={{...styles.input, width:'95%', marginBottom:'10px'}}
        />
        <input 
          type="text" placeholder="Photo URL (Optional)" 
          value={newPhoto} onChange={(e) => setNewPhoto(e.target.value)} 
          style={{...styles.input, width:'95%', marginBottom:'15px'}}
        />
        <button onClick={handleRegisterWorker} style={styles.registerBtn}>Register & Generate ID</button>
      </div>

      {/* 💰 SECTION 2: MANAGE FINANCE (For ID: 1234) */}
      <div style={styles.card}>
        <h3>Manage Finance (ID: {targetWorkerId})</h3>
        <div style={styles.row}>
          <div style={{flex:1}}>
            <span style={styles.label}>Set Daily Wage</span>
            <input type="number" value={dailyWage} onChange={(e) => setDailyWage(e.target.value)} style={styles.input}/>
          </div>
          <button onClick={updateWage} style={styles.updateBtn}>Save</button>
        </div>
        
        <hr style={{margin:'20px 0', opacity:0.2}}/>
        
        <input 
          type="number" placeholder="Enter Amount (₹)" 
          value={amount} onChange={(e) => setAmount(e.target.value)} 
          style={{...styles.input, width:'95%', marginBottom:'15px'}}
        />
        <div style={{display:'flex', gap:'10px'}}>
          <button onClick={() => addFinance('adv')} style={styles.advBtn}>Add Advance</button>
          <button onClick={() => addFinance('ded')} style={styles.dedBtn}>Add Deduction</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  adminContainer: { padding: '20px', maxWidth: '500px', margin: '0 auto', fontFamily: 'sans-serif', background: '#f4f7f6', minHeight: '100vh' },
  loginOverlay: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#764ba2' },
  loginBox: { background: '#fff', padding: '40px', borderRadius: '20px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' },
  title: { textAlign: 'center', color: '#764ba2', fontSize: '22px', marginBottom: '20px' },
  card: { background: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '20px' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px', outline: 'none' },
  loginBtn: { width: '100%', padding: '12px', marginTop: '15px', background: '#764ba2', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  registerBtn: { width: '100%', padding: '15px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
  row: { display: 'flex', gap: '10px', alignItems: 'flex-end' },
  label: { fontSize: '11px', color: '#888', marginBottom: '5px', display: 'block' },
  updateBtn: { padding: '12px 20px', background: '#764ba2', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  advBtn: { flex: 1, padding: '15px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold' },
  dedBtn: { flex: 1, padding: '15px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold' },
};
