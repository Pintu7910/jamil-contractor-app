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
  const [newName, setNewName] = useState('');
  const [photoBase64, setPhotoBase64] = useState('');
  const [loading, setLoading] = useState(false); 
  const [errorLog, setErrorLog] = useState(''); // 🔴 Error dikhane ke liye naya state
  const [newAttDate, setNewAttDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (isAuthorized) {
      const unsub = onSnapshot(collection(db, "workers"), (snap) => {
        setWorkersList(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }, (err) => setErrorLog("Firestore Error: " + err.message));
      return () => unsub();
    }
  }, [isAuthorized]);

  const handlePhoto = (e) => {
    setErrorLog(''); // Reset error on new photo
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 300; 
        canvas.height = (img.height / img.width) * 300;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setPhotoBase64(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRegister = async () => {
    if (!newName) return alert("Naam likhein!");
    setLoading(true);
    setErrorLog(''); // Purana error saaf karein
    
    const newId = Math.floor(1000 + Math.random() * 9000).toString();
    let photoURL = "";

    try {
      if (photoBase64) {
        console.log("Starting Storage Upload...");
        const sRef = ref(storage, `workers/${newId}.jpg`);
        // Yahan timeout logic (optional)
        await uploadString(sRef, photoBase64, 'data_url');
        photoURL = await getDownloadURL(sRef);
        console.log("Storage Upload Success!");
      }

      console.log("Starting Firestore Save...");
      await setDoc(doc(db, "workers", newId), {
        name: newName, 
        photo: photoURL, 
        dailyWage: 0,
        totalPaidEarnings: 0, 
        approvedAttendance: [],
        paymentHistory: []
      });
      console.log("Firestore Save Success!");

      alert(`✅ Worker Registered! ID: ${newId}`);
      setNewName(''); setPhotoBase64('');
    } catch (err) { 
      console.error(err);
      // 🔴 SCREEN PAR ERROR DIKHAYEGA
      setErrorLog(`❌ PROBLEM: ${err.code || 'Error'} - ${err.message}`); 
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthorized) return (
    <div style={styles.loginOverlay}>
      <div style={styles.loginBox}>
        <h2>🔐 JAMIL ADMIN</h2>
        <input type="password" value={pin} onChange={(e)=>setPin(e.target.value)} style={styles.input} placeholder="PIN"/>
        <button onClick={() => pin === "832300" ? setIsAuthorized(true) : alert("Galat PIN")} style={styles.blueBtn}>Unlock</button>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <h2 style={{textAlign:'center', color:'#4a148c'}}>MD JAMIL PANEL</h2>

      {/* 🔴 LIVE ERROR LOG BOX */}
      {errorLog && (
        <div style={{background:'#ffebee', color:'#c62828', padding:'10px', borderRadius:'10px', marginBottom:'15px', border:'1px solid #ef9a9a', fontSize:'12px'}}>
          <b>System Error Alert:</b><br/>
          {errorLog}
          <button onClick={()=>setErrorLog('')} style={{float:'right', border:'none', background:'none', color:'red', fontWeight:'bold'}}>Hide</button>
        </div>
      )}

      {/* Select Worker Section (Simplified) */}
      <div style={styles.card}>
        <h4>👥 Workers ({workersList.length})</h4>
        <div style={styles.workerGrid}>
          {workersList.map(w => (
            <div key={w.id} onClick={() => setSelectedWorker(w)} style={styles.workerItem}>
              <img src={w.photo || "https://via.placeholder.com/45"} style={styles.avatar}/>
              <span style={{fontSize:'10px'}}>{w.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Registration Section */}
      <div style={styles.card}>
        <h4>🆕 Register New Worker</h4>
        <input type="text" placeholder="Worker Name" value={newName} onChange={(e)=>setNewName(e.target.value)} style={styles.input}/>
        <input id="photo-input" type="file" accept="image/*" onChange={handlePhoto} style={{margin:'10px 0', fontSize:'12px'}}/>
        
        {photoBase64 && <p style={{color:'green', fontSize:'10px'}}>✅ Photo compressed & ready!</p>}
        
        <button 
          onClick={handleRegister} 
          disabled={loading} 
          style={{...styles.blueBtn, background: loading ? '#ccc' : '#3498db'}}
        >
          {loading ? "⌛ Registering... (Check Logs Above)" : "Register Now"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '15px', maxWidth: '450px', margin: '0 auto', fontFamily:'sans-serif' },
  card: { background: '#fff', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '15px' },
  workerGrid: { display: 'flex', gap: '10px', overflowX: 'auto' },
  workerItem: { minWidth: '70px', textAlign:'center', padding:'5px' },
  avatar: { width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover' },
  input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' },
  blueBtn: { width: '100%', padding: '12px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold' },
  loginOverlay: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#764ba2' },
  loginBox: { background: '#fff', padding: '30px', borderRadius: '20px', textAlign: 'center', width:'80%' }
};
