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
  const [activeTab, setActiveTab] = useState('earn');
  const [loading, setLoading] = useState(false); // Registering state check karne ke liye
  const [newAttDate, setNewAttDate] = useState(new Date().toISOString().split('T')[0]);

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

  // ✅ Photo Compression Logic (Wapas Add Kar Diya)
  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300; // Photo ki width choti rakhein
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // 0.6 quality matlab photo size bahut kam ho jayegi par dikhne mein sahi rahegi
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.6);
        setPhotoBase64(compressedDataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRegister = async () => {
    if (!newName) return alert("Naam likhein!");
    if (!photoBase64) return alert("Photo select karein!");
    
    setLoading(true); // Button ko disable karne ke liye
    const newId = Math.floor(1000 + Math.random() * 9000).toString();
    let photoURL = "";

    try {
      // 1. Photo ko Storage mein upload karein
      const sRef = ref(storage, `workers/${newId}.jpg`);
      await uploadString(sRef, photoBase64, 'data_url');
      photoURL = await getDownloadURL(sRef);

      // 2. Firestore mein sirf photoURL save karein
      await setDoc(doc(db, "workers", newId), {
        name: newName, 
        photo: photoURL, 
        dailyWage: 0,
        totalPaidEarnings: 0, 
        approvedAttendance: [],
        paymentHistory: []
      });

      alert(`✅ Worker Registered! ID: ${newId}`);
      setNewName(''); 
      setPhotoBase64('');
      // Reset file input
      if(document.getElementById('photo-input')) document.getElementById('photo-input').value = "";
    } catch (err) { 
      alert("Error: " + err.message); 
    } finally {
      setLoading(false);
    }
  };

  // --- Baaki functions (updateWage, processFinance, etc.) same hain ---
  const updateWage = async () => {
    if (!dailyWageInput || !selectedWorker) return;
    await updateDoc(doc(db, "workers", selectedWorker.id), { dailyWage: Number(dailyWageInput) });
    setDailyWageInput('');
    alert("💰 Dihadi Update Ho Gayi!");
  };

  const processFinance = async () => {
    if (!amount || !selectedWorker) return alert("Amount daaliye!");
    const workerRef = doc(db, "workers", selectedWorker.id);
    const date = new Date().toLocaleDateString('en-GB');
    const val = Number(amount);
    await updateDoc(workerRef, { 
      totalPaidEarnings: increment(val), 
      paymentHistory: arrayUnion({ date, amount: val, note: "Payment / Advance" }) 
    });
    setAmount('');
    alert("✅ Hisaab Update Ho Gaya!");
  };

  const addManualAttendance = async () => {
    if (!selectedWorker) return;
    const dateStr = new Date(newAttDate).toLocaleDateString('en-GB');
    const workerRef = doc(db, "workers", selectedWorker.id);
    await updateDoc(workerRef, {
      approvedAttendance: arrayUnion({ date: dateStr, status: 'Approved' })
    });
    alert("✅ Haziri Jod Di Gayi!");
  };

  const handleAttAction = async (idx, action) => {
    let list = [...selectedWorker.approvedAttendance];
    if (action === 'delete') {
      if(confirm("Haziri delete karein?")) list.splice(idx, 1);
    } else if (action === 'edit') {
      const newDate = prompt("Nayi date likhein (DD/MM/YYYY):", list[idx].date);
      if (newDate) list[idx].date = newDate;
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
                 <p style={{margin:0, fontSize:'12px', color:'#666'}}>ID: {selectedWorker.id} | <b>Dihadi: ₹{selectedWorker.dailyWage || 0}</b></p>
               </div>
               <button onClick={async() => {if(confirm("Worker delete karein?")) await deleteDoc(doc(db,"workers",selectedWorker.id))}} style={styles.delBtn}>🗑️</button>
            </div>
            <div style={{display:'flex', gap:'5px', marginTop:'15px'}}>
              <input type="number" placeholder="Nayi Dihadi" value={dailyWageInput} onChange={(e)=>setDailyWageInput(e.target.value)} style={styles.input}/>
              <button onClick={updateWage} style={{...styles.blueBtn, width:'80px'}}>Set</button>
            </div>
            <div style={styles.statGrid}>
              <div style={{...styles.stat, color:'blue'}}>Kul Kamayi (Wages)<br/><b>₹{totalEarned}</b></div>
              <div style={{...styles.stat, color:'green', background:'#f1f8e9'}}>Baki (Pending)<br/><b>₹{bakiPayment}</b></div>
            </div>
            <input type="number" placeholder="Enter Amount (₹)" value={amount} onChange={(e)=>setAmount(e.target.value)} style={{...styles.input, marginTop:'15px'}}/>
            <button onClick={processFinance} style={styles.greenBtn}>💵 Payment / Advance</button>
          </div>

          <div style={styles.card}>
            <div style={styles.tabBar}>
              <button onClick={()=>setActiveTab('earn')} style={{...styles.tab, borderBottom: activeTab==='earn'?'2px solid #764ba2':''}}>Haziri</button>
              <button onClick={()=>setActiveTab('cash')} style={{...styles.tab, borderBottom: activeTab==='cash'?'2px solid #764ba2':''}}>Payments</button>
            </div>
            <div style={styles.historyContent}>
              {activeTab === 'earn' && (
                <>
                  <div style={{display:'flex', gap:'5px', marginBottom:'15px', padding:'10px', background:'#f9f9f9', borderRadius:'10px'}}>
                    <input type="date" value={newAttDate} onChange={(e)=>setNewAttDate(e.target.value)} style={{...styles.input, padding:'5px'}} />
                    <button onClick={addManualAttendance} style={{...styles.miniBtn, background:'#764ba2', width:'60px'}}>Add</button>
                  </div>
                  {selectedWorker.approvedAttendance?.map((a, i) => (
                    <div key={i} style={styles.row}>
                      <span>{a.date} ({a.status})</span>
                      <div style={{display:'flex', gap:'8px'}}>
                        <button onClick={() => handleAttAction(i, 'Approved')} style={{...styles.miniBtn, background:a.status==='Approved'?'#4caf50':'#ccc'}}>✔</button>
                        <button onClick={() => handleAttAction(i, 'delete')} style={{...styles.miniBtn, background:'#666'}}>🗑️</button>
                      </div>
                    </div>
                  )).reverse()}
                </>
              )}
              {activeTab === 'cash' && (
                selectedWorker.paymentHistory?.map((h, i) => (
                  <div key={i} style={styles.row}><span>{h.date}</span><span style={{color:'green', fontWeight:'bold'}}>₹{h.amount}</span></div>
                )).reverse()
              )}
            </div>
          </div>
        </>
      )}

      <div style={styles.card}>
        <h4>🆕 Register New Worker</h4>
        <input type="text" placeholder="Worker Name" value={newName} onChange={(e)=>setNewName(e.target.value)} style={styles.input}/>
        <input id="photo-input" type="file" accept="image/*" onChange={handlePhoto} style={{margin:'10px 0', fontSize:'12px'}}/>
        
        {photoBase64 && <p style={{color:'green', fontSize:'11px'}}>✅ Photo compressed & ready!</p>}
        
        <button 
          onClick={handleRegister} 
          disabled={loading} 
          style={{...styles.blueBtn, background: loading ? '#ccc' : '#3498db'}}
        >
          {loading ? "⌛ Registering... Please Wait" : "Register Now"}
        </button>
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
  statGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' },
  stat: { padding: '12px', background: '#fbfbfb', borderRadius: '10px', textAlign: 'center', fontSize: '11px', border: '1px solid #eee' },
  input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' },
  blueBtn: { width: '100%', padding: '12px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold' },
  greenBtn: { width: '100%', padding: '15px', background: '#66bb6a', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold' },
  tabBar: { display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', marginBottom: '10px' },
  tab: { padding: '10px 20px', border: 'none', background: 'none', fontSize: '12px', fontWeight: 'bold', cursor:'pointer' },
  historyContent: { maxHeight: '300px', overflowY: 'auto' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems:'center', padding: '10px 0', borderBottom: '1px solid #f9f9f9', fontSize: '12px' },
  miniBtn: { border: 'none', color: '#fff', padding: '5px 8px', borderRadius: '5px', cursor: 'pointer' },
  delBtn: { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' },
  loginOverlay: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  loginBox: { background: '#fff', padding: '30px', borderRadius: '25px', textAlign: 'center', width:'80%' }
};
