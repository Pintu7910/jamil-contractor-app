"use client";
import { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase'; 
import { doc, onSnapshot, updateDoc, setDoc, collection, deleteDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

export default function AdminPanel() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pin, setPin] = useState('');
  const [workersList, setWorkersList] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [dailyWageInput, setDailyWageInput] = useState('');
  const [newName, setNewName] = useState('');
  const [photoBase64, setPhotoBase64] = useState('');
  const [loading, setLoading] = useState(false); 
  const [isCompressing, setIsCompressing] = useState(false); 

  useEffect(() => {
    if (!isAuthorized) return;
    const unsub = onSnapshot(collection(db, "workers"), (snap) => {
      setWorkersList(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [isAuthorized]);

  const handlePinSubmit = () => {
    if (pin === "832300") setIsAuthorized(true);
    else alert("❌ Galat PIN!");
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsCompressing(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 400; 
        canvas.height = (img.height / img.width) * 400;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setPhotoBase64(canvas.toDataURL('image/jpeg', 0.6));
        setIsCompressing(false);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRegister = async () => {
    if (!newName || !photoBase64) return alert("Naam aur Photo dono zaroori hain!");
    
    setLoading(true);
    const newId = Date.now().toString().slice(-6); // Unique ID based on time
    
    try {
      // 1. Direct Upload
      const sRef = ref(storage, `workers/${newId}.jpg`);
      await uploadString(sRef, photoBase64, 'data_url');
      
      // 2. Get URL
      const photoURL = await getDownloadURL(sRef);
      
      // 3. Save to Firestore
      await setDoc(doc(db, "workers", newId), {
        name: newName, 
        photo: photoURL, 
        dailyWage: 0,
        totalPaidEarnings: 0, 
        approvedAttendance: [],
        paymentHistory: []
      });
      
      alert("✅ Worker Register Ho Gaya!");
      setNewName('');
      setPhotoBase64('');
      if(document.getElementById('photo-input')) document.getElementById('photo-input').value = "";
      
    } catch (err) { 
      console.error(err);
      alert("Error: " + err.message); 
    } finally {
      setLoading(false);
    }
  };

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
      <h2 style={{textAlign:'center', color:'#4a148c'}}>MD JAMIL PANEL</h2>

      <div style={styles.card}>
        <h4>👥 Workers ({workersList.length})</h4>
        <div style={styles.workerGrid}>
          {workersList.map(w => (
            <div key={w.id} onClick={() => setSelectedWorker(w)} 
                 style={{...styles.workerItem, background: selectedWorker?.id === w.id ? '#f3e5f5' : 'transparent'}}>
              <img src={w.photo || "https://via.placeholder.com/45"} style={styles.avatar}/>
              <span style={{fontSize:'10px'}}>{w.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.card}>
        <h4>🆕 Naya Worker</h4>
        <input type="text" placeholder="Worker Name" value={newName} onChange={(e)=>setNewName(e.target.value)} style={styles.input}/>
        <input id="photo-input" type="file" accept="image/*" onChange={handlePhoto} style={{margin:'10px 0'}}/>
        
        <button 
            onClick={handleRegister} 
            disabled={loading || isCompressing} 
            style={{...styles.blueBtn, background: loading ? '#ccc' : '#3498db'}}
        >
          {loading ? "⌛ Registering..." : "Register Now"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '15px', maxWidth: '450px', margin: '0 auto' },
  card: { background: '#fff', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '15px' },
  workerGrid: { display: 'flex', gap: '10px', overflowX: 'auto' },
  workerItem: { minWidth: '70px', textAlign: 'center', padding: '5px', borderRadius: '8px' },
  avatar: { width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover' },
  input: { width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '5px' },
  blueBtn: { width: '100%', padding: '12px', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold' },
  loginOverlay: { height: '100vh', background: '#764ba2', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  loginBox: { background: '#fff', padding: '30px', borderRadius: '20px', width: '80%', textAlign: 'center' }
};
