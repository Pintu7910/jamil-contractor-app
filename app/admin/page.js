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
    if (!isAuthorized) return;
    console.log("Fetching workers...");
    const unsub = onSnapshot(collection(db, "workers"), (snap) => {
      const workers = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setWorkersList(workers);
    }, (error) => {
      console.error("Firestore Subscribe Error:", error);
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
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400; 
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d', { alpha: false });
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6); 
        setPhotoBase64(dataUrl);
        setIsCompressing(false);
        console.log("Photo compressed successfully");
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRegister = async () => {
    if (!newName) return alert("Naam likhein!");
    if (isCompressing) return alert("Photo taiyar ho rahi hai...");
    
    console.log("Starting Registration...");
    setLoading(true); 
    const newId = Math.floor(1000 + Math.random() * 9000).toString();
    let photoURL = "";
    
    try {
      if (photoBase64) {
        console.log("Uploading photo to Storage...");
        const sRef = ref(storage, `workers/${newId}.jpg`); // Added .jpg extension
        // Yahan 'data_url' format ensure karna zaroori hai
        const uploadResult = await uploadString(sRef, photoBase64, 'data_url');
        console.log("Upload finished, getting URL...");
        photoURL = await getDownloadURL(uploadResult.ref);
      }
      
      console.log("Saving data to Firestore...");
      const workerDoc = {
        name: newName, 
        photo: photoURL, 
        dailyWage: 0,
        totalPaidEarnings: 0, 
        approvedAttendance: [],
        paymentHistory: []
      };

      await setDoc(doc(db, "workers", newId), workerDoc);
      console.log("Firestore Save Success!");
      
      alert(`✅ Worker Registered! ID: ${newId}`);
      setNewName(''); 
      setPhotoBase64('');
      if(document.getElementById('photo-input')) document.getElementById('photo-input').value = "";
      
    } catch (err) { 
      console.error("FULL ERROR LOG:", err);
      alert("Registration Failed: " + err.message); 
    } finally {
      console.log("Process finished, stopping loader.");
      setLoading(false);
    }
  };

  // --- Summary UI simplified for debugging ---
  const updateWage = async () => {
    if (!dailyWageInput || !selectedWorker) return;
    try {
      await updateDoc(doc(db, "workers", selectedWorker.id), { dailyWage: Number(dailyWageInput) });
      setDailyWageInput('');
      alert("💰 Dihadi Updated!");
    } catch (e) { alert(e.message); }
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

      {/* Select Worker */}
      <div style={styles.card}>
        <h4>👥 Select Worker ({workersList.length})</h4>
        <div style={styles.workerGrid}>
          {workersList.map(w => (
            <div key={w.id} onClick={() => setSelectedWorker(w)} 
                 style={{...styles.workerItem, background: selectedWorker?.id === w.id ? '#f3e5f5' : 'transparent', border: selectedWorker?.id === w.id ? '2px solid #764ba2' : '1px solid #eee'}}>
              <img src={w.photo || "https://via.placeholder.com/45"} style={styles.avatar}/>
              <span style={{fontSize:'10px', marginTop:'4px'}}>{w.name}</span>
            </div>
          ))}
        </div>
      </div>

      {selectedWorker && (
        <div style={styles.card}>
            <h3>{selectedWorker.name}</h3>
            <p>ID: {selectedWorker.id} | Wage: ₹{selectedWorker.dailyWage}</p>
            <input type="number" placeholder="New Wage" value={dailyWageInput} onChange={(e)=>setDailyWageInput(e.target.value)} style={styles.input}/>
            <button onClick={updateWage} style={{...styles.blueBtn, marginTop:'10px'}}>Update Wage</button>
            <button onClick={async() => {if(confirm("Delete?")) await deleteDoc(doc(db,"workers",selectedWorker.id))}} style={{background:'red', color:'white', border:'none', padding:'5px', marginTop:'10px', borderRadius:'5px'}}>Delete Worker</button>
        </div>
      )}

      {/* Register New Worker */}
      <div style={styles.card}>
        <h4>🆕 Register New Worker</h4>
        <input type="text" placeholder="Worker Name" value={newName} onChange={(e)=>setNewName(e.target.value)} style={styles.input}/>
        <input id="photo-input" type="file" accept="image/*" onChange={handlePhoto} style={{margin:'10px 0'}}/>
        
        {isCompressing && <p style={{color:'orange'}}>⏳ Processing Image...</p>}
        {photoBase64 && !isCompressing && <p style={{color:'green'}}>✅ Photo Ready!</p>}
        
        <button 
            onClick={handleRegister} 
            disabled={loading || isCompressing} 
            style={{...styles.blueBtn, opacity: (loading || isCompressing) ? 0.6 : 1}}
        >
          {loading ? "⌛ Registering... Please Wait" : "Register Now"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '15px', maxWidth: '450px', margin: '0 auto', fontFamily:'sans-serif' },
  card: { background: '#fff', padding: '15px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '15px' },
  workerGrid: { display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' },
  workerItem: { minWidth: '70px', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', padding: '5px', borderRadius: '8px' },
  avatar: { width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover' },
  input: { width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '5px' },
  blueBtn: { width: '100%', padding: '12px', background: '#3498db', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold' },
  loginOverlay: { height: '100vh', background: '#764ba2', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  loginBox: { background: '#fff', padding: '30px', borderRadius: '20px', width: '80%', textAlign: 'center' }
};
