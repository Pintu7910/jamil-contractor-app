"use client";
import { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase'; 
import { doc, onSnapshot, updateDoc, setDoc, arrayUnion, increment, collection, deleteDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

export default function AdminPanel() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pin, setPin] = useState('');
  const [workersList, setWorkersList] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [amount, setAmount] = useState('');
  const [dailyWageInput, setDailyWageInput] = useState('');
  const [newName, setNewName] = useState('');
  const [photoBase64, setPhotoBase64] = useState('');
  const [showAttendance, setShowAttendance] = useState(false);

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
  }, [isAuthorized, selectedWorker?.id]);

  const handlePinSubmit = () => {
    if (pin === "832300") setIsAuthorized(true);
    else alert("❌ Galat PIN!");
  };

  // --- Worker Registration with Photo ---
  const handlePhoto = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => setPhotoBase64(reader.result);
    reader.readAsDataURL(file);
  };

  const handleRegister = async () => {
    if (!newName) return alert("Naam likhein!");
    const newId = Math.floor(1000 + Math.random() * 9000).toString();
    let photoURL = "";
    try {
      if (photoBase64) {
        const sRef = ref(storage, `workers/${newId}`);
        await uploadString(sRef, photoBase64, 'data_url');
        photoURL = await getDownloadURL(sRef);
      }
      await setDoc(doc(db, "workers", newId), {
        name: newName, photo: photoURL, dailyWage: 0,
        totalAdvance: 0, totalPaidEarnings: 0, approvedAttendance: [],
        advanceHistory: [], paymentHistory: []
      });
      alert(`✅ ID: ${newId} Registered!`);
      setNewName(''); setPhotoBase64('');
    } catch (err) { alert("Error: " + err.message); }
  };

  // --- Attendance & Finance ---
  const handleAttAction = async (idx, action) => {
    let list = [...selectedWorker.approvedAttendance];
    if (action === 'delete') list.splice(idx, 1);
    else list[idx].status = action;
    await updateDoc(doc(db, "workers", selectedWorker.id), { approvedAttendance: list });
  };

  const updateWage = async () => {
    if (!dailyWageInput || !selectedWorker) return;
    await updateDoc(doc(db, "workers", selectedWorker.id), { dailyWage: Number(dailyWageInput) });
    setDailyWageInput('');
    alert("Dihadi Set!");
  };

  const processFinance = async (type) => {
    if (!amount || !selectedWorker) return alert("Amount daaliye!");
    const ref = doc(db, "workers", selectedWorker.id);
    const date = new Date().toLocaleDateString('en-GB');
    const val = Number(amount);
    let updateData = {};
    if (type === 'adv') updateData = { totalAdvance: increment(val), advanceHistory: arrayUnion({ date, amount: val, note: "Advance Diya" }) };
    if (type === 'settle') updateData = { totalAdvance: increment(-val), advanceHistory: arrayUnion({ date, amount: -val, note: "Settlement" }) };
    if (type === 'cash') updateData = { totalPaidEarnings: increment(val), paymentHistory: arrayUnion({ date, amount: val, note: "Cash Payment" }) };
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
        <button onClick={handlePinSubmit} style={styles.blueBtn}>Unlock</button>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <h2 style={{textAlign:'center', color:'#764ba2'}}>MD JAMIL CONTROL PANEL</h2>

      {/* Register Section */}
      <div style={styles.card}>
        <h4>🆕 Register Worker</h4>
        <input type="text" placeholder="Name" value={newName} onChange={(e)=>setNewName(e.target.value)} style={styles.input}/>
        <input type="file" onChange={handlePhoto} style={{fontSize:'12px', margin:'10px 0'}}/>
        <button onClick={handleRegister} style={styles.blueBtn}>Add Worker</button>
      </div>

      {/* Select Section */}
      <div style={styles.card}>
        <h4>👤 Select Worker</h4>
        <select onChange={(e) => setSelectedWorker(workersList.find(w => w.id === e.target.value))} style={styles.input}>
          <option value="">Choose Worker...</option>
          {workersList.map(w => <option key={w.id} value={w.id}>{w.name} ({w.id})</option>)}
        </select>
      </div>

      {selectedWorker && (
        <>
          <div style={styles.card}>
            <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px'}}>
               <img src={selectedWorker.photo || "https://via.placeholder.com/50"} style={styles.avatar}/>
               <h3 style={{margin:0}}>Manage {selectedWorker.name}</h3>
               <button onClick={async() => {if(confirm("Delete?")) await deleteDoc(doc(db,"workers",selectedWorker.id))}} style={{marginLeft:'auto'}}>🗑️</button>
            </div>

            <div style={{display:'flex', gap:'5px', marginBottom:'15px'}}>
              <input type="number" placeholder="Dihadi" value={dailyWageInput} onChange={(e)=>setDailyWageInput(e.target.value)} style={styles.input}/>
              <button onClick={updateWage} style={{...styles.blueBtn, width:'80px'}}>Set</button>
            </div>

            <div style={styles.statGrid}>
              <div style={{...styles.stat, color:'red'}}>Advance:<br/><b>₹{selectedWorker.totalAdvance}</b></div>
              <div style={{...styles.stat, color:'blue'}}>Kamayi:<br/><b>₹{totalEarned}</b></div>
              <div style={{...styles.stat, color:'green', background:'#f0fdf4'}}>Baki:<br/><b>₹{bakiPayment}</b></div>
            </div>

            <button onClick={() => setShowAttendance(!showAttendance)} style={styles.toggleBtn}>
              {showAttendance ? "Hide Attendance" : "✅ Manage Attendance"}
            </button>

            {showAttendance && (
              <div style={styles.scrollBox}>
                {selectedWorker.approvedAttendance?.map((a, i) => (
                  <div key={i} style={styles.row}>
                    <span>{a.date} ({a.status})</span>
                    <div style={{display:'flex', gap:'5px'}}>
                      <button onClick={() => handleAttAction(i, 'Approved')} style={styles.miniBtnG}>✔</button>
                      <button onClick={() => handleAttAction(i, 'Rejected')} style={styles.miniBtnR}>✖</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <input type="number" placeholder="Amount (₹)" value={amount} onChange={(e)=>setAmount(e.target.value)} style={{...styles.input, marginTop:'15px'}}/>
            <div style={styles.btnStack}>
              <button onClick={() => processFinance('adv')} style={styles.redBtn}>Dena Advance (+)</button>
              <button onClick={() => processFinance('settle')} style={styles.orangeBtn}>Advance se Kaatna (-)</button>
              <button onClick={() => processFinance('cash')} style={styles.greenBtn}>Cash Payment Dena</button>
            </div>
          </div>

          <div style={styles.card}>
            <h4>📜 History</h4>
            <div style={styles.scrollBox}>
              <p style={{fontSize:'12px', color:'#666'}}>ADVANCE RECORDS</p>
              {selectedWorker.advanceHistory?.map((h,i)=>(<div key={i} style={styles.row}><span>{h.date}</span><span style={{color:h.amount<0?'green':'red'}}>{h.amount}</span></div>))}
              <hr/>
              <p style={{fontSize:'12px', color:'#666'}}>CASH PAYMENTS</p>
              {selectedWorker.paymentHistory?.map((h,i)=>(<div key={i} style={styles.row}><span>{h.date}</span><span style={{color:'green'}}>₹{h.amount}</span></div>))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '15px', maxWidth: '450px', margin: '0 auto', background: '#f0f2f5', minHeight: '100vh', fontFamily:'sans-serif' },
  card: { background: '#fff', padding: '15px', borderRadius: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '15px' },
  input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing:'border-box' },
  statGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px' },
  stat: { padding: '10px', background: '#f9fafb', borderRadius: '8px', textAlign: 'center', fontSize: '11px', border:'1px solid #eee' },
  btnStack: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' },
  blueBtn: { width: '100%', padding: '12px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold' },
  redBtn: { padding: '15px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold' },
  orangeBtn: { padding: '15px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold' },
  greenBtn: { padding: '15px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold' },
  avatar: { width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' },
  scrollBox: { marginTop:'10px', maxHeight:'150px', overflowY:'auto', padding:'5px', border:'1px solid #eee', borderRadius:'8px' },
  row: { display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #f9f9f9', fontSize:'13px' },
  toggleBtn: { width:'100%', padding:'10px', background:'#eee', border:'none', borderRadius:'8px', fontSize:'12px', marginTop:'10px' },
  miniBtnG: { background:'#10b981', color:'#fff', border:'none', padding:'3px 8px', borderRadius:'4px' },
  miniBtnR: { background:'#ef4444', color:'#fff', border:'none', padding:'3px 8px', borderRadius:'4px' },
  loginOverlay: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#764ba2' },
  loginBox: { background: '#fff', padding: '30px', borderRadius: '20px', textAlign: 'center' }
};
