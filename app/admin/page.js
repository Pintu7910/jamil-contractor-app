"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, setDoc, arrayUnion, increment, collection } from 'firebase/firestore';

export default function AdminPanel() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pin, setPin] = useState('');
  const [workersList, setWorkersList] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [amount, setAmount] = useState('');
  const [view, setView] = useState('main'); 
  const [newName, setNewName] = useState('');
  const [compressedPhoto, setCompressedPhoto] = useState('');

  // Authorized fetch
  useEffect(() => {
    if (isAuthorized) {
      const unsub = onSnapshot(collection(db, "workers"), (snap) => {
        const workers = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setWorkersList(workers);
        if (selectedWorker) {
          const updated = workers.find(w => w.id === selectedWorker.id);
          setSelectedWorker(updated);
        }
      });
      return () => unsub();
    }
  }, [isAuthorized]);

  const handlePinSubmit = () => {
    if (pin === "832300") setIsAuthorized(true);
    else alert("❌ Galat PIN!");
  };

  // Finance Logic: Settlement & Payment
  const processFinance = async (actionType) => {
    if (!amount || !selectedWorker) return;
    const ref = doc(db, "workers", selectedWorker.id);
    const date = new Date().toLocaleDateString('en-GB');
    let updateData = {};

    if (actionType === 'give_advance') {
      // Worker ko naya udhaar/advance dena
      updateData = {
        totalAdvance: increment(Number(amount)),
        advanceHistory: arrayUnion({ date, amount: Number(amount), note: "Naya Advance" })
      };
    } 
    else if (actionType === 'settle_from_advance') {
      // Advance se paisa kaatna (Advance balance kam hoga)
      updateData = {
        totalAdvance: increment(-Number(amount)),
        advanceHistory: arrayUnion({ date, amount: -Number(amount), note: "Advance se Kata gaya" })
      };
    }
    else if (actionType === 'cash_payment') {
      // Worker ko uski kamayi (attendance) ka cash dena
      updateData = {
        totalDeducted: increment(Number(amount)), // Yeh track karega kitna pay ho chuka hai
        deductionHistory: arrayUnion({ date, amount: Number(amount), note: "Cash Payment Diya" })
      };
    }

    await updateDoc(ref, updateData);
    setAmount('');
    alert("✅ Hisab update ho gaya!");
  };

  // Helper: Calculate Earnings
  const totalEarned = (selectedWorker?.approvedAttendance?.filter(a => a.status === 'Approved').length || 0) * (selectedWorker?.dailyWage || 0);
  const netPayable = totalEarned - (selectedWorker?.totalDeducted || 0);

  if (!isAuthorized) return (
    <div style={styles.loginOverlay}>
      <div style={styles.loginBox}>
        <h2>🔐 Admin Access</h2>
        <input type="password" value={pin} onChange={(e) => setPin(e.target.value)} style={styles.input} placeholder="PIN"/>
        <button onClick={handlePinSubmit} style={styles.loginBtn}>Unlock</button>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2>JAMIL CONTROL PANEL</h2>
        <button onClick={() => setView(view === 'main' ? 'history' : 'main')} style={styles.toggleBtn}>
          {view === 'main' ? "📁 Worker History" : "⬅️ Back"}
        </button>
      </header>

      {view === 'main' ? (
        <>
          {/* Worker Selection */}
          <div style={styles.card}>
            <h3>📋 Select Worker</h3>
            <select onChange={(e) => setSelectedWorker(workersList.find(w => w.id === e.target.value))} style={styles.input}>
              <option>Choose Worker...</option>
              {workersList.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>

          {selectedWorker && (
            <div style={styles.card}>
              <h3>Manage: {selectedWorker.name}</h3>
              <div style={styles.financeGrid}>
                <div style={{...styles.stat, borderLeft:'4px solid #ef4444'}}>
                  Advance: <br/><b>₹{selectedWorker.totalAdvance}</b>
                </div>
                <div style={{...styles.stat, borderLeft:'4px solid #3498db'}}>
                  Kamayi ({selectedWorker.dailyWage}/din): <br/><b>₹{totalEarned}</b>
                </div>
              </div>

              <div style={{background:'#eef2ff', padding:'10px', borderRadius:'8px', marginBottom:'15px'}}>
                <span style={{fontSize:'12px'}}>Baki Payment (Attendance ke hisab se):</span>
                <h2 style={{margin:0, color:'#1e40af'}}>₹{netPayable}</h2>
              </div>

              <input type="number" placeholder="Enter Amount" value={amount} onChange={(e)=>setAmount(e.target.value)} style={styles.input}/>
              
              <div style={styles.btnGrid}>
                <button onClick={() => processFinance('give_advance')} style={styles.redBtn}>Dena Advance (+)</button>
                <button onClick={() => processFinance('settle_from_advance')} style={styles.orangeBtn}>Advance se Kaatna (-)</button>
                <button onClick={() => processFinance('cash_payment')} style={styles.greenBtn}>Cash Payment Dena</button>
              </div>
            </div>
          )}
        </>
      ) : (
        /* History view stays similar but shows notes */
        <div style={styles.historyList}>
           {/* Previous history list code */}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '15px', maxWidth: '500px', margin: '0 auto', background: '#f4f7f6', minHeight: '100vh', fontFamily:'sans-serif' },
  header: { textAlign: 'center', marginBottom: '20px' },
  card: { background: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '15px' },
  input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', marginBottom:'10px', boxSizing:'border-box' },
  financeGrid: { display: 'flex', gap: '10px', marginBottom: '15px' },
  stat: { flex: 1, padding: '10px', background: '#fff', borderRadius: '8px', fontSize: '11px', boxShadow:'inset 0 0 5px rgba(0,0,0,0.05)' },
  btnGrid: { display: 'grid', gridTemplateColumns: '1fr', gap: '10px', marginTop: '10px' },
  redBtn: { padding: '15px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold' },
  orangeBtn: { padding: '15px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold' },
  greenBtn: { padding: '15px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold' },
  toggleBtn: { padding: '8px 15px', background: '#764ba2', color: '#fff', border: 'none', borderRadius: '5px' },
  loginOverlay: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#764ba2' },
  loginBox: { background: '#fff', padding: '30px', borderRadius: '20px', textAlign: 'center' },
  loginBtn: { width: '100%', padding: '12px', marginTop: '10px', background: '#764ba2', color: '#fff', border: 'none', borderRadius: '8px' }
};
