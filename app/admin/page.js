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
  const [activeTab, setActiveTab] = useState('earn'); // Default tab change to Attendance

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
      alert(`✅ Worker Registered! ID: ${newId}`);
      setNewName(''); setPhotoBase64('');
    } catch (err) { alert("Error: " + err.message); }
  };

  const updateWage = async () => {
    if (!dailyWageInput || !selectedWorker) return;
    await updateDoc(doc(db, "workers", selectedWorker.id), { dailyWage: Number(dailyWageInput) });
    setDailyWageInput('');
    alert("💰 Dihadi Update Ho Gayi!");
  };

  const processFinance = async (type) => {
    if (!amount || !selectedWorker) return alert("Amount daaliye!");
    const workerRef = doc(db, "workers", selectedWorker.id);
    const date = new Date().toLocaleDateString('en-GB');
    const val = Number(amount);
    let updateData = {};

    if (type === 'payment') {
      // Combined Advance + Cash Payment logic
      updateData = { 
        totalPaidEarnings: increment(val), 
        paymentHistory: arrayUnion({ date, amount: val, note: "Paisa Diya" }) 
      };
    } else if (type === 'settle') {
      // Purana advance adjust karne ke liye
      updateData = { 
        totalAdvance: increment(-val), 
        advanceHistory: arrayUnion({ date, amount: -val, note: "Adjustment" }) 
      };
    }

    await updateDoc(workerRef, updateData);
    setAmount('');
    alert("✅ Hisaab Update Ho Gaya!");
  };

  const handleAttAction = async (idx, action) => {
    let list = [...selectedWorker.approvedAttendance];
    if (action === 'delete') {
      if(confirm("Haziri delete karein?")) list.splice(idx, 1);
    } else {
      list[idx].status = action;
    }
    await updateDoc(doc(db, "workers", selectedWorker.id), { approvedAttendance: list });
  };

  const approvedAttendance = selectedWorker?.approvedAttendance?.filter(a => a.status === 'Approved') || [];
  const totalEarned = approvedAttendance.length * (selectedWorker?.dailyWage || 0);
  const bakiPayment = totalEarned - (selectedWorker?.totalPaidEarnings || 0);

  if (!isAuthorized) return (
    <div style={styles.loginOverlay}>
      <div style={styles.loginBox}>
        <h2>🔐 JAMIL ADMIN</h2>
        <input type="password" value={pin} onChange={(e)=>setPin(e.target.value)} style={styles.input} placeholder="PIN"/>
        <button onClick={handlePinSubmit} style={styles.blueBtn}>Unlock</button>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <h2 style={{textAlign:'center', color:'#4a148c'}}>MD JAMIL CONTROL PANEL</h2>

      {/* Select Worker Grid */}
      <div style={styles.card}>
        <h4>👥 Select Worker</h4>
        <div style={styles.workerGrid}>
          {workersList.map(w => (
            <div key={w.id} onClick={() => setSelectedWorker(w)} 
                 style={{...styles.workerItem, background: selectedWorker?.id === w.id ? '#f3e5f5' : 'transparent', border: selectedWorker?.id === w.id ? '2px solid #764ba2' : '1px solid #eee'}}>
              <img src={w.photo || "https://via.placeholder.com/45"} style={styles.avatar}/>
              <span style={{fontSize:'10px', fontWeight:'bold', marginTop:'4px'}}>{w.name}</span>
            </div>
          ))}
        </div>
      </div>

      {selectedWorker && (
        <>
          <div style={styles.card}>
            <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
               <img src={selectedWorker.photo || "https://via.placeholder.com/60"} style={styles.largeAvatar}/>
               <div style={{flex:1}}>
                 <h3 style={{margin:0}}>{selectedWorker.name}</h3>
                 <p style={{margin:0, fontSize:'12px', color:'#666'}}>Dihadi: ₹{selectedWorker.dailyWage}</p>
               </div>
               <button onClick={async() => {if(confirm("Worker delete karein?")) await deleteDoc(doc(db,"workers",selectedWorker.id))}} style={styles.delBtn}>🗑️</button>
            </div>

            <div style={{display:'flex', gap:'5px', marginTop:'15px'}}>
              <input type="number" placeholder="Nayi Dihadi" value={dailyWageInput} onChange={(e)=>setDailyWageInput(e.target.value)} style={styles.input}/>
              <button onClick={updateWage} style={{...styles.blueBtn, width:'80px'}}>Set</button>
            </div>

            <div style={styles.statGrid}>
              <div style={{...styles.stat, color:'red'}}>Udhaar<br/><b>₹{selectedWorker.totalAdvance}</b></div>
              <div style={{...styles.stat, color:'blue'}}>Kamayi<br/><b>₹{totalEarned}</b></div>
              <div style={{...styles.stat, color:'green', background:'#f1f8e9'}}>Baki<br/><b>₹{bakiPayment}</b></div>
            </div>

            <input type="number" placeholder="Amount (₹)" value={amount} onChange={(e)=>setAmount(e.target.value)} style={{...styles.input, marginTop:'15px'}}/>
            <div style={styles.btnStack}>
              <button onClick={() => processFinance('payment')} style={styles.greenBtn}>💵 Paisa Diya (Cash/Advance)</button>
              <button onClick={() => processFinance('settle')} style={styles.orangeBtn}>🔸 Purana Udhaar Kaatna (-)</button>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.tabBar}>
              <button onClick={()=>setActiveTab('earn')} style={{...styles.tab, color: activeTab==='earn'?'#764ba2':'#999', borderBottom: activeTab==='earn'?'2px solid #764ba2':''}}>Haziri</button>
              <button onClick={()=>setActiveTab('cash')} style={{...styles.tab, color: activeTab==='cash'?'#764ba2':'#999', borderBottom: activeTab==='cash'?'2px solid #764ba2':''}}>Payments</button>
              <button onClick={()=>setActiveTab('adv')} style={{...styles.tab, color: activeTab==='adv'?'#764ba2':'#999', borderBottom: activeTab==='adv'?'2px solid #764ba2':''}}>Udhaar History</button>
            </div>

            <div style={styles.historyContent}>
              {activeTab === 'earn' && (
                selectedWorker.approvedAttendance?.length > 0 ? (
                  selectedWorker.approvedAttendance.map((a, i) => (
                    <div key={i} style={styles.row}>
                      <span>{a.date} ({a.status})</span>
                      <div style={{display:'flex', gap:'8px'}}>
                        <button onClick={() => handleAttAction(i, 'Approved')} style={{...styles.miniBtn, background:a.status==='Approved'?'#4caf50':'#ccc'}}>✔</button>
                        <button onClick={() => handleAttAction(i, 'Rejected')} style={{...styles.miniBtn, background:a.status==='Rejected'?'#f44336':'#ccc'}}>✖</button>
                        <button onClick={() => handleAttAction(i, 'delete')} style={{...styles.miniBtn, background:'#666'}}>🗑️</button>
                      </div>
                    </div>
                  ))
                ) : <p style={styles.empty}>No Attendance Found</p>
              )}

              {activeTab === 'cash' && (
                selectedWorker.paymentHistory?.length > 0 ? (
                  selectedWorker.paymentHistory.map((h, i) => (
                    <div key={i} style={styles.row}><span>{h.date}</span><span style={{color:'green', fontWeight:'bold'}}>₹{h.amount}</span></div>
                  ))
                ) : <p style={styles.empty}>No Payment Records</p>
              )}

              {activeTab === 'adv' && (
                selectedWorker.advanceHistory?.length > 0 ? (
                  selectedWorker.advanceHistory.map((h, i) => (
                    <div key={i} style={styles.row}><span>{h.date}</span><span style={{color:h.amount<0?'green':'red', fontWeight:'bold'}}>{h.amount > 0 ? `+${h.amount}` : h.amount}</span></div>
                  ))
                ) : <p style={styles.empty}>No Udhaar History</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Register New Section */}
      <div style={styles.card}>
        <h4>🆕 Naya Worker Register Karein</h4>
        <input type="text" placeholder="Naam" value={newName} onChange={(e)=>setNewName(e.target.value)} style={styles.input}/>
        <input type="file" onChange={handlePhoto} style={{margin:'10px 0', fontSize:'12px'}}/>
        <button onClick={handleRegister} style={styles.blueBtn}>Register Now</button>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '15px', maxWidth: '480px', margin: '0 auto', background: '#f8f9fa', minHeight: '100vh', fontFamily:'sans-serif' },
  card: { background: '#fff', padding: '15px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '15px' },
  workerGrid: { display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '10px' },
  workerItem: { minWidth: '75px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px', borderRadius: '12px', cursor: 'pointer' },
  avatar: { width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover' },
  largeAvatar: { width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border:'2px solid #764ba2' },
  statGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '15px' },
  stat: { padding: '12px', background: '#fbfbfb', borderRadius: '10px', textAlign: 'center', fontSize: '11px', border: '1px solid #eee' },
  input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' },
  btnStack: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' },
  blueBtn: { width: '100%', padding: '12px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold' },
  orangeBtn: { padding: '15px', background: '#ffa726', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold' },
  greenBtn: { padding: '15px', background: '#66bb6a', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold' },
  tabBar: { display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', marginBottom: '10px' },
  tab: { padding: '12px 5px', border: 'none', background: 'none', fontSize: '11px', fontWeight: 'bold' },
  historyContent: { maxHeight: '250px', overflowY: 'auto' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems:'center', padding: '12px 0', borderBottom: '1px solid #f9f9f9', fontSize: '13px' },
  miniBtn: { border: 'none', color: '#fff', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' },
  delBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' },
  empty: { textAlign:'center', color:'#999', fontSize:'12px', padding:'20px 0' },
  loginOverlay: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  loginBox: { background: '#fff', padding: '30px', borderRadius: '25px', textAlign: 'center', width:'80%' }
};
