"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, setDoc, arrayUnion, increment, collection, getDocs, deleteDoc } from 'firebase/firestore';

export default function AdminPanel() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pin, setPin] = useState('');
  const [workersList, setWorkersList] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [amount, setAmount] = useState('');
  const [dailyWage, setDailyWage] = useState('');
  const [view, setView] = useState('main'); // 'main' or 'history'

  const [newName, setNewName] = useState('');
  const [compressedPhoto, setCompressedPhoto] = useState('');

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

  // 1. PIN Check
  const handlePinSubmit = () => {
    if (pin === "832300") setIsAuthorized(true);
    else alert("❌ Galat PIN!");
  };

  // 2. Image Compression Logic (Canvas)
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300; 
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setCompressedPhoto(canvas.toDataURL('image/jpeg', 0.7)); // 70% Quality
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // 3. Register Worker
  const handleRegister = async () => {
    if (!newName) return alert("Naam bhariye!");
    const newId = Math.floor(1000 + Math.random() * 9000).toString();
    await setDoc(doc(db, "workers", newId), {
      name: newName, photo: compressedPhoto, dailyWage: 0,
      totalAdvance: 0, totalDeducted: 0, approvedAttendance: [],
      advanceHistory: [], deductionHistory: [], status: "Offline"
    });
    alert(`✅ Registered! ID: ${newId}`);
    setNewName(''); setCompressedPhoto('');
  };

  // 4. Payment & Attendance Logic
  const handleAttendanceAction = async (index, action) => {
    let updatedAttendance = [...selectedWorker.approvedAttendance];
    if (action === 'delete') updatedAttendance.splice(index, 1);
    else updatedAttendance[index].status = action; // 'Approved' or 'Rejected'

    await updateDoc(doc(db, "workers", selectedWorker.id), { approvedAttendance: updatedAttendance });
  };

  const addFinance = async (type) => {
    if (!amount) return;
    const ref = doc(db, "workers", selectedWorker.id);
    const date = new Date().toLocaleDateString('en-GB');
    const updateData = type === 'adv' 
      ? { totalAdvance: increment(Number(amount)), advanceHistory: arrayUnion({ date, amount: Number(amount) }) }
      : { totalDeducted: increment(Number(amount)), deductionHistory: arrayUnion({ date, amount: Number(amount) }) };
    await updateDoc(ref, updateData);
    setAmount('');
  };

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
          {view === 'main' ? "📁 View Worker History" : "⬅️ Back to Panel"}
        </button>
      </header>

      {view === 'main' ? (
        <>
          <div style={styles.card}>
            <h3>🆕 Register Worker</h3>
            <input type="text" placeholder="Worker Name" value={newName} onChange={(e)=>setNewName(e.target.value)} style={styles.input}/>
            <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{margin:'10px 0'}}/>
            {compressedPhoto && <img src={compressedPhoto} style={styles.preview}/>}
            <button onClick={handleRegister} style={styles.registerBtn}>Register Worker</button>
          </div>

          <div style={styles.card}>
            <h3>📋 Select Worker to Manage</h3>
            <select onChange={(e) => setSelectedWorker(workersList.find(w => w.id === e.target.value))} style={styles.input}>
              <option>Select Worker</option>
              {workersList.map(w => <option key={w.id} value={w.id}>{w.name} ({w.id})</option>)}
            </select>
          </div>

          {selectedWorker && (
            <div style={styles.card}>
              <h3>Manage {selectedWorker.name}</h3>
              <div style={styles.financeGrid}>
                <div style={styles.stat}>Bakaya: ₹{selectedWorker.totalAdvance - selectedWorker.totalDeducted}</div>
                <div style={styles.stat}>Kaam: {selectedWorker.approvedAttendance.length} Din</div>
              </div>
              <input type="number" placeholder="Amount" value={amount} onChange={(e)=>setAmount(e.target.value)} style={styles.input}/>
              <div style={{display:'flex', gap:'10px', marginTop:'10px'}}>
                <button onClick={() => addFinance('adv')} style={styles.advBtn}>Give Advance</button>
                <button onClick={() => addFinance('ded')} style={styles.dedBtn}>Deduct Payment</button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div style={styles.historyList}>
          {workersList.map(w => (
            <div key={w.id} style={styles.workerRow} onClick={() => {setSelectedWorker(w); setView('historyDetail')}}>
              <img src={w.photo} style={styles.roundPhoto}/>
              <div style={{flex:1}}>
                <b style={{fontSize:'16px'}}>{w.name}</b>
                <p style={{margin:0, fontSize:'12px', color:'#666'}}>ID: {w.id} | Bakaya: ₹{w.totalAdvance - w.totalDeducted}</p>
              </div>
              <span>➡️</span>
            </div>
          ))}
        </div>
      )}

      {/* History Detail View */}
      {view === 'historyDetail' && selectedWorker && (
        <div style={styles.detailOverlay}>
          <div style={styles.detailBox}>
            <button onClick={() => setView('history')} style={styles.closeBtn}>Close</button>
            <h3>Attendance Control: {selectedWorker.name}</h3>
            <div style={styles.scrollArea}>
              {selectedWorker.approvedAttendance.map((a, i) => (
                <div key={i} style={styles.attendanceRow}>
                  <span>{a.date}</span>
                  <div style={{display:'flex', gap:'5px'}}>
                    <button onClick={() => handleAttendanceAction(i, 'Approved')} style={styles.miniBtnG}>Approve</button>
                    <button onClick={() => handleAttendanceAction(i, 'Rejected')} style={styles.miniBtnR}>Reject</button>
                    <button onClick={() => handleAttendanceAction(i, 'delete')} style={styles.miniBtn}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '15px', maxWidth: '600px', margin: '0 auto', background: '#f8f9fa', minHeight: '100vh' },
  header: { textAlign: 'center', marginBottom: '20px' },
  loginOverlay: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#764ba2' },
  loginBox: { background: '#fff', padding: '30px', borderRadius: '20px', textAlign: 'center' },
  card: { background: '#fff', padding: '15px', borderRadius: '15px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '15px' },
  input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing:'border-box' },
  registerBtn: { width: '100%', padding: '15px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '10px', marginTop: '10px', fontWeight: 'bold' },
  toggleBtn: { padding: '10px', background: '#764ba2', color: '#fff', border: 'none', borderRadius: '5px', fontSize: '12px' },
  preview: { width: '60px', height: '60px', borderRadius: '10px', objectFit: 'cover', marginTop: '10px' },
  workerRow: { display: 'flex', alignItems: 'center', gap: '15px', background: '#fff', padding: '15px', borderRadius: '12px', marginBottom: '10px', cursor: 'pointer' },
  roundPhoto: { width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' },
  detailOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' },
  detailBox: { background: '#fff', width: '100%', maxWidth: '400px', borderRadius: '20px', padding: '20px' },
  scrollArea: { maxHeight: '300px', overflowY: 'auto', marginTop: '15px' },
  attendanceRow: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' },
  miniBtnG: { background: '#22c55e', color: '#fff', border: 'none', padding: '5px 8px', borderRadius: '5px', fontSize: '10px' },
  miniBtnR: { background: '#ef4444', color: '#fff', border: 'none', padding: '5px 8px', borderRadius: '5px', fontSize: '10px' },
  miniBtn: { background: '#eee', border: 'none', padding: '5px 8px', borderRadius: '5px' },
  financeGrid: { display: 'flex', gap: '10px', marginBottom: '10px' },
  stat: { flex: 1, padding: '10px', background: '#f0f0f0', borderRadius: '8px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' },
  advBtn: { flex: 1, background: '#ef4444', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold' },
  dedBtn: { flex: 1, background: '#22c55e', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold' },
  closeBtn: { float: 'right', padding: '5px 10px', background: '#ddd', border: 'none', borderRadius: '5px' }
};
