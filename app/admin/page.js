"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, setDoc, arrayUnion, increment, collection, deleteDoc } from 'firebase/firestore';

export default function AdminPanel() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pin, setPin] = useState('');
  const [workersList, setWorkersList] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [amount, setAmount] = useState('');
  const [dailyWageInput, setDailyWageInput] = useState('');
  const [newName, setNewName] = useState('');
  const [compressedPhoto, setCompressedPhoto] = useState('');
  const [showAttendance, setShowAttendance] = useState(false); // New State

  useEffect(() => {
    if (isAuthorized) {
      const unsub = onSnapshot(collection(db, "workers"), (snap) => {
        const workers = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setWorkersList(workers);
        if (selectedWorker) {
          const updated = workers.find(w => w.id === selectedWorker.id);
          setSelectedWorker(updated || null);
        }
      });
      return () => unsub();
    }
  }, [isAuthorized]);

  const handlePinSubmit = () => {
    if (pin === "832300") setIsAuthorized(true);
    else alert("❌ Galat PIN!");
  };

  // --- Functions ---
  const handleRegister = async () => {
    if (!newName) return alert("Naam likhein!");
    const newId = Math.floor(1000 + Math.random() * 9000).toString();
    await setDoc(doc(db, "workers", newId), {
      name: newName, photo: compressedPhoto || "", dailyWage: 0,
      totalAdvance: 0, totalPaidEarnings: 0, approvedAttendance: [],
      advanceHistory: [], paymentHistory: [], status: "Offline"
    });
    alert(`✅ Registered! ID: ${newId}`);
    setNewName(''); setCompressedPhoto('');
  };

  const handleAttendanceAction = async (index, action) => {
    let updated = [...selectedWorker.approvedAttendance];
    if (action === 'delete') updated.splice(index, 1);
    else updated[index].status = action;
    await updateDoc(doc(db, "workers", selectedWorker.id), { approvedAttendance: updated });
  };

  const deleteWorker = async (id) => {
    if(window.confirm("Kya aap sach mein is worker ko hatana chahte hain?")) {
      await deleteDoc(doc(db, "workers", id));
      setSelectedWorker(null);
      alert("Worker deleted.");
    }
  };

  const processFinance = async (actionType) => {
    if (!amount || !selectedWorker) return;
    const ref = doc(db, "workers", selectedWorker.id);
    const date = new Date().toLocaleDateString('en-GB');
    const val = Number(amount);
    let updateData = {};
    if (actionType === 'give_advance') {
      updateData = { totalAdvance: increment(val), advanceHistory: arrayUnion({ date, amount: val, note: "Advance Diya" }) };
    } else if (actionType === 'settle_from_advance') {
      updateData = { totalAdvance: increment(-val), advanceHistory: arrayUnion({ date, amount: -val, note: "Settle Kiya" }) };
    } else if (actionType === 'cash_payment') {
      updateData = { totalPaidEarnings: increment(val), paymentHistory: arrayUnion({ date, amount: val, note: "Cash Payment" }) };
    }
    await updateDoc(ref, updateData);
    setAmount('');
  };

  // Calculations
  const approvedDays = selectedWorker?.approvedAttendance?.filter(a => a.status === 'Approved').length || 0;
  const totalEarned = approvedDays * (selectedWorker?.dailyWage || 0);
  const bakiPayment = totalEarned - (selectedWorker?.totalPaidEarnings || 0);

  if (!isAuthorized) return (
    <div style={styles.loginOverlay}>
      <div style={styles.loginBox}>
        <h2>🔐 Admin Access</h2>
        <input type="password" value={pin} onChange={(e)=>setPin(e.target.value)} style={styles.input} placeholder="PIN"/>
        <button onClick={handlePinSubmit} style={styles.loginBtn}>Unlock</button>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <h2 style={{textAlign:'center', color:'#764ba2'}}>JAMIL CONTROL PANEL</h2>

      <div style={styles.card}>
        <h3>🆕 Register Worker</h3>
        <input type="text" placeholder="Name" value={newName} onChange={(e)=>setNewName(e.target.value)} style={styles.input}/>
        <button onClick={handleRegister} style={styles.blueBtn}>Register Worker</button>
      </div>

      <div style={styles.card}>
        <h3>👤 Select Worker</h3>
        <select onChange={(e) => setSelectedWorker(workersList.find(w => w.id === e.target.value))} style={styles.input}>
          <option value="">Choose Worker...</option>
          {workersList.map(w => <option key={w.id} value={w.id}>{w.name} ({w.id})</option>)}
        </select>
      </div>

      {selectedWorker && (
        <>
          <div style={styles.card}>
            <div style={{display:'flex', justifyContent:'space-between'}}>
                <h3>Manage: {selectedWorker.name}</h3>
                <button onClick={() => deleteWorker(selectedWorker.id)} style={{background:'none', border:'none'}}>🗑️</button>
            </div>

            <div style={styles.statGrid}>
              <div style={{...styles.stat, color:'red'}}>Advance:<br/><b>₹{selectedWorker.totalAdvance}</b></div>
              <div style={{...styles.stat, color:'blue'}}>Kamayi:<br/><b>₹{totalEarned}</b></div>
              <div style={{...styles.stat, color:'green'}}>Baki:<br/><b>₹{bakiPayment}</b></div>
            </div>

            <button onClick={() => setShowAttendance(!showAttendance)} style={styles.toggleBtn}>
              {showAttendance ? "Hide Haziri Panel" : "✅ Haziri (Attendance) Manage Karein"}
            </button>

            {showAttendance && (
              <div style={styles.attendanceBox}>
                {selectedWorker.approvedAttendance.map((a, i) => (
                  <div key={i} style={styles.attRow}>
                    <span>{a.date} ({a.status})</span>
                    <div style={{display:'flex', gap:'5px'}}>
                      <button onClick={() => handleAttendanceAction(i, 'Approved')} style={styles.miniBtnG}>✔</button>
                      <button onClick={() => handleAttendanceAction(i, 'Rejected')} style={styles.miniBtnR}>✖</button>
                      <button onClick={() => handleAttendanceAction(i, 'delete')} style={styles.miniBtn}>🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <input type="number" placeholder="Amount (₹)" value={amount} onChange={(e)=>setAmount(e.target.value)} style={{...styles.input, marginTop:'15px'}}/>
            <div style={styles.btnStack}>
              <button onClick={() => processFinance('give_advance')} style={styles.redBtn}>Dena Advance (+)</button>
              <button onClick={() => processFinance('settle_from_advance')} style={styles.orangeBtn}>Advance se Kaatna (-)</button>
              <button onClick={() => processFinance('cash_payment')} style={styles.greenBtn}>Cash Payment Dena</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '15px', maxWidth: '500px', margin: '0 auto', background: '#f0f2f5', minHeight: '100vh' },
  card: { background: '#fff', padding: '15px', borderRadius: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '15px' },
  input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing:'border-box', marginBottom:'10px' },
  statGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px', marginBottom:'15px' },
  stat: { padding: '10px', background: '#f9fafb', borderRadius: '8px', textAlign: 'center', fontSize: '11px', border:'1px solid #eee' },
  btnStack: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' },
  blueBtn: { width: '100%', padding: '12px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold' },
  redBtn: { padding: '15px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold' },
  orangeBtn: { padding: '15px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold' },
  greenBtn: { padding: '15px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold' },
  toggleBtn: { width:'100%', padding:'10px', background:'#eee', border:'none', borderRadius:'8px', fontSize:'12px', marginTop:'10px' },
  attendanceBox: { marginTop:'10px', maxHeight:'200px', overflowY:'auto', border:'1px solid #eee', padding:'10px', borderRadius:'8px' },
  attRow: { display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid #f0f0f0', fontSize:'12px' },
  miniBtnG: { background:'#10b981', color:'#fff', border:'none', padding:'3px 8px', borderRadius:'4px' },
  miniBtnR: { background:'#ef4444', color:'#fff', border:'none', padding:'3px 8px', borderRadius:'4px' },
  miniBtn: { background:'#ddd', border:'none', padding:'3px 8px', borderRadius:'4px' },
  loginOverlay: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#764ba2' },
  loginBox: { background: '#fff', padding: '30px', borderRadius: '20px', textAlign: 'center' },
  loginBtn: { width: '100%', padding: '12px', marginTop: '10px', background: '#764ba2', color: '#fff', border: 'none', borderRadius: '8px' }
};
