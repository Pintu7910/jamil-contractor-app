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
  const [loading, setLoading] = useState(false); 
  const [isCompressing, setIsCompressing] = useState(false); 

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

  // ⚡ SUPER FAST COMPRESSION LOGIC
  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsCompressing(true);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 500; // Optimal width for speed
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d', { alpha: false }); // CPU usage kam karta hai
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'medium';
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Quality 0.7 fast processing aur acchi quality ka balance hai
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7); 
        setPhotoBase64(dataUrl);
        setIsCompressing(false);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRegister = async () => {
    if (!newName) return alert("Naam likhein!");
    if (isCompressing) return alert("Photo processing mein hai, thoda rukiye...");
    
    setLoading(true); 
    const newId = Math.floor(1000 + Math.random() * 9000).toString();
    let photoURL = "";
    
    try {
      if (photoBase64) {
        const sRef = ref(storage, `workers/${newId}`);
        await uploadString(sRef, photoBase64, 'data_url');
        photoURL = await getDownloadURL(sRef);
      }
      
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
      document.getElementById('photo-input').value = ""; // Input clear
    } catch (err) { 
      console.error("Registration Error:", err);
      alert("Error: " + err.message); 
    } finally {
      setLoading(false);
    }
  };

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
              <div style={{...styles.stat, color:'blue'}}>Kul Kamayi<br/><b>₹{totalEarned}</b></div>
              <div style={{...styles.stat, color:'green', background:'#f1f8e9'}}>Baki<br/><b>₹{bakiPayment}</b></div>
            </div>

            <input type="number" placeholder="Enter Amount (₹)" value={amount} onChange={(e)=>setAmount(e.target.value)} style={{...styles.input, marginTop:'15px'}}/>
            <button onClick={processFinance} style={{...styles.greenBtn, marginTop:'10px'}}>💵 Payment / Advance</button>
        </div>
      )}

      <div style={styles.card}>
        <h4>🆕 Register New Worker</h4>
        <input type="text" placeholder="Worker Name" value={newName} onChange={(e)=>setNewName(e.target.value)} style={styles.input}/>
        <input id="photo-input" type="file" accept="image/*" onChange={handlePhoto} style={{margin:'10px 0', fontSize:'12px'}}/>
        
        {isCompressing && <p style={{fontSize:'10px', color:'orange'}}>⏳ Processing photo...</p>}
        {photoBase64 && !isCompressing && <p style={{fontSize:'10px', color:'green'}}>✅ Photo ready!</p>}
        
        <button 
            onClick={handleRegister} 
            disabled={loading || isCompressing} 
            style={{...styles.blueBtn, opacity: (loading || isCompressing) ? 0.7 : 1}}
        >
          {loading ? "Registering..." : isCompressing ? "Wait..." : "Register Now"}
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
  blueBtn: { width: '100%', padding: '12px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  greenBtn: { width: '100%', padding: '15px', background: '#66bb6a', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold' },
  delBtn: { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' },
  loginOverlay: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  loginBox: { background: '#fff', padding: '30px', borderRadius: '25px', textAlign: 'center', width:'80%' }
};
