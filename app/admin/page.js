"use client";
import { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase'; 
import { doc, onSnapshot, setDoc, collection } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

export default function AdminPanel() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [pin, setPin] = useState('');
  const [workersList, setWorkersList] = useState([]);
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

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsCompressing(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 300; 
        canvas.height = (img.height / img.width) * 300;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setPhotoBase64(canvas.toDataURL('image/jpeg', 0.5));
        setIsCompressing(false);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRegister = async () => {
    if (!newName || !photoBase64) return alert("Naam aur Photo dono daalein!");
    
    setLoading(true);
    const newId = Date.now().toString().slice(-4); // Unique ID

    try {
      console.log("Photo upload ho rahi hai...");
      const storageRef = ref(storage, `workers/${newId}.jpg`);
      
      // Photo ko pehle Storage mein upload karein
      const uploadTask = await uploadString(storageRef, photoBase64, 'data_url');
      const downloadURL = await getDownloadURL(uploadTask.ref);
      console.log("Photo URL mil gaya:", downloadURL);

      // Ab sirf URL ko Firestore mein save karein
      await setDoc(doc(db, "workers", newId), {
        name: newName,
        photo: downloadURL, // Pehle yahan base64 tha, ab URL hai
        dailyWage: 0,
        totalPaidEarnings: 0,
        approvedAttendance: [],
        paymentHistory: [],
        status: "Offline"
      });

      alert("✅ Worker Registered!");
      setNewName('');
      setPhotoBase64('');
      document.getElementById('photo-input').value = "";
    } catch (err) {
      console.error("Mazaak nahi, error hai:", err);
      alert("Registration failed! Check your Storage rules.");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthorized) return (
    <div style={{padding:'50px', textAlign:'center'}}>
      <input type="password" placeholder="PIN" onChange={(e)=>setPin(e.target.value)} style={{padding:'10px', borderRadius:'5px'}}/>
      <button onClick={() => pin === "832300" && setIsAuthorized(true)} style={{marginLeft:'10px'}}>Unlock</button>
    </div>
  );

  return (
    <div style={{padding:'20px', maxWidth:'400px', margin:'0 auto', fontFamily:'sans-serif'}}>
      <h2 style={{textAlign:'center', color:'#4a148c'}}>MD JAMIL PANEL</h2>
      
      <div style={{background:'#fff', padding:'15px', borderRadius:'10px', boxShadow:'0 2px 10px rgba(0,0,0,0.1)'}}>
        <input type="text" placeholder="Worker Name" value={newName} onChange={(e)=>setNewName(e.target.value)} style={{width:'100%', padding:'10px', marginBottom:'10px', boxSizing:'border-box'}}/>
        <input id="photo-input" type="file" accept="image/*" onChange={handlePhoto} style={{marginBottom:'10px'}}/>
        
        <button 
          onClick={handleRegister} 
          disabled={loading || isCompressing}
          style={{width:'100%', padding:'12px', background: loading ? '#ccc' : '#3498db', color:'#fff', border:'none', borderRadius:'8px', fontWeight:'bold'}}
        >
          {loading ? "⌛ Registering..." : "Register Now"}
        </button>
      </div>
    </div>
  );
}
