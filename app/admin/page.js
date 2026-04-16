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
  const [view, setView] = useState('main'); // 'main' or 'history'

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
        setCompressedPhoto(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRegister = async () => {
    if (!newName) return alert("Naam likhein!");
    const newId = Math.floor(1000 + Math.random() * 9000).toString();
    await setDoc(doc(db, "workers", newId), {
      name: newName, photo: compressedPhoto || "", dailyWage: 0,
      totalAdvance: 0, totalPaidEarnings: 0, approvedAttendance: [],
      advanceHistory: [], paymentHistory: [], status: "Offline"
    });
    alert(`✅ ID: ${newId} Registered!`);
    setNewName(''); setCompressedPhoto('');
  };

  const processFinance = async (type) => {
    if (!amount || !selectedWorker) return;
    const ref = doc(db, "workers", selectedWorker.id);
    const date = new Date().toLocaleDateString('en-GB');
    const val = Number(amount);
    
    let updateData = {};
    if (type === 'adv') updateData = { totalAdvance: increment(val), advanceHistory: arrayUnion({ date, amount: val, note: "Advance Diya" }) };
    if (type === 'settle') updateData = { totalAdvance: increment(-val), advanceHistory: arrayUnion({ date, amount: -val, note: "Settle from Adv" }) };
    if (type === 'cash') updateData = { totalPaidEarnings: increment(val), paymentHistory: arrayUnion({ date, amount: val, note: "Cash Payment" }) };

    await updateDoc(ref, updateData);
    setAmount('');
  };

  const deleteWorker = async (id) => {
    if (confirm("Worker delete karein?")) await deleteDoc(doc(db, "workers", id));
  };

  const approvedDays = selectedWorker?.approvedAttendance?.filter(a => a.status === 'Approved').length || 0;
  const totalEarned = approvedDays * (selectedWorker?.dailyWage || 0);
  const bakiPayment = totalEarned - (selectedWorker?.totalPaidEarnings || 0);

  if (!isAuthorized) return (
    <div style={styles.loginOverlay}>
      <div style={styles.loginBox}><h2>🔐 Admin</h2><input type="password" value={pin} onChange={(e)=>setPin(e.target.value)} style={styles.input}/><button onClick={handlePinSubmit} style={styles.blueBtn}>Unlock</button></div>
    </div>
  );

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2>JAMIL CONTROL PANEL</h2>
        <button onClick={() => setView(view === 'main' ? 'history' : 'main')} style={styles.toggleBtn}>
          {view === 'main' ? "📁 Worker Records" : "⬅️ Back to Home"}
        </button>
      </header>

      {view === 'main' ? (
        <>
          <div style={styles.card}>
            <h3>🆕 Register</h3>
            <input type="text" placeholder="Name" value={newName} onChange={(e)=>setNewName(e.target.value)} style={styles.input}/>
            <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{margin:'10px 0'}} />
            <button onClick={handleRegister} style={styles.blueBtn}>Add Worker</button>
          </div>

          <div style={styles.card}>
            <h3>👤 Select Worker</h3>
            <select onChange={(e) => setSelectedWorker(workersList.find(w => w.id === e.target.value))} style={styles.input}>
              <option value="">Choose...</option>
              {workersList.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>

          {selectedWorker && (
            <div style={styles.card}>
              <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                <img src={selectedWorker.photo || "https://via.placeholder.com/50"} style={styles.roundImg} />
                <h3>{selectedWorker.name}</h3>
              </div>
              <div style={styles.statGrid}>
                <div style={styles.stat}>Adv: <br/><b>₹{selectedWorker.totalAdvance}</b></div>
                <div style={styles.stat}>Earned: <br/><b>₹{totalEarned}</b></div>
                <div style={styles.stat}>Baki: <br/><b>₹{bakiPayment}</b></div>
              </div>
              <input type="number" placeholder="Enter Amount" value={amount} onChange={(e)=>setAmount(e.target.value)} style={{...styles.input, marginTop:'10px'}}/>
              <div style={styles.btnStack}>
                <button onClick={()=>processFinance('adv')} style={styles.redBtn}>Advance Diya (+)</button>
                <button onClick={()=>processFinance('settle')} style={styles.orangeBtn}>Adv se Kata (-)</button>
                <button onClick={()=>processFinance('cash')} style={styles.greenBtn}>Cash Payment Diya</button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div style={styles.historyList}>
          {workersList.map(w => (
            <div key={w.id} style={styles.workerRow} onClick={() => setSelectedWorker(w)}>
              <img src={w.photo || "https://via.placeholder.com/50"} style={styles.roundImg} />
              <div style={{flex:1}}>
                <b>{w.name}</b>
                <p style={{margin:0, fontSize:'12px'}}>Baki: ₹{(w.approvedAttendance.filter(a=>a.status==='Approved').length * w.dailyWage) - w.totalPaidEarnings}</p>
              </div>
              <button onClick={()=>deleteWorker(w.id)} style={styles.delBtn}>🗑️</button>
            </div>
          ))}
          {selectedWorker && (
            <div style={styles.detailBox}>
              <h4>Transaction History: {selectedWorker.name}</h4>
              <div style={styles.scrollArea}>
                {selectedWorker.advanceHistory.map((h,i)=>(<div key={i} style={styles.row}><span>{h.date} (Adv)</span><span style={{color:h.amount<0?'green':'red'}}>{h.amount}</span></div>))}
                {selectedWorker.paymentHistory.map((h,i)=>(<div key={i} style={styles.row}><span>{h.date} (Cash)</span><span style={{color:'green'}}>₹{h.amount}</span></div>))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '15px', maxWidth: '450px', margin: '0 auto', background: '#f5f7fb', minHeight: '100vh' },
  header: { textAlign: 'center', marginBottom: '15px' },
  card: { background: '#fff', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '10px' },
  input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing:'border-box' },
  statGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px', marginTop:'10px' },
  stat: { padding: '8px', background: '#f9f9f9', borderRadius: '6px', textAlign: 'center', fontSize: '11px', border:'1px solid #eee' },
  btnStack: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' },
  blueBtn: { width: '100%', padding: '12px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold' },
  redBtn: { padding: '12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold' },
  orangeBtn: { padding: '12px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold' },
  greenBtn: { padding: '12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold' },
  toggleBtn: { padding:'8px 15px', background:'#764ba2', color:'#fff', border:'none', borderRadius:'5px', fontSize:'12px' },
  workerRow: { display:'flex', alignItems:'center', gap:'10px', background:'#fff', padding:'10px', borderRadius:'10px', marginBottom:'5px', cursor:'pointer' },
  roundImg: { width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover' },
  detailBox: { marginTop:'20px', background:'#fff', padding:'15px', borderRadius:'10px' },
  scrollArea: { maxHeight:'200px', overflowY:'auto' },
  row: { display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #eee', fontSize:'13px' },
  delBtn: { background:'none', border:'none', fontSize:'18px' },
  loginOverlay: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#764ba2' },
  loginBox: { background: '#fff', padding: '25px', borderRadius: '15px', textAlign: 'center' }
};
