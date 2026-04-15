"use client";
import { useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';

export default function WorkerDashboard() {
  const [worker, setWorker] = useState(null);
  const [uniqueID, setUniqueID] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [image, setImage] = useState(null);

  // Image compress karne ka function
  const handleImage = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 300; // Small size for fast upload
        canvas.height = 300;
        ctx.drawImage(img, 0, 0, 300, 300);
        setImage(canvas.toDataURL('image/jpeg', 0.7)); // 0.7 compression
      };
    };
  };

  const verifyID = async () => {
    const docRef = doc(db, "workers", uniqueID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setWorker({ id: docSnap.id, ...docSnap.data() });
      setIsVerified(true);
    } else { alert("ID galat hai!"); }
  };

  const updateStatus = async (status) => {
    if (!image) return alert("Pehle site ki photo lein!");
    
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const workerRef = doc(db, "workers", worker.id);
      const log = {
        status,
        time: new Date().toLocaleTimeString(),
        fullDate: new Date().toLocaleDateString(),
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        photo: image,
        approved: false // Admin approval ke liye
      };

      await updateDoc(workerRef, {
        currentStatus: status,
        attendanceHistory: arrayUnion(log)
      });
      alert("Attendance bhej di gayi hai. Admin approval ka intezar karein.");
    });
  };

  if (!isVerified) return (
    <div style={container}>
      <div style={glassCard}>
        <h2>Worker ID Check</h2>
        <input style={input} placeholder="Enter ID" onChange={e => setUniqueID(e.target.value)} />
        <button style={btn} onClick={verifyID}>Verify ID</button>
      </div>
    </div>
  );

  return (
    <div style={container}>
      <div style={glassCard}>
        <h3>Welcome, {worker.name}</h3>
        <p>Site ki photo lein:</p>
        <input type="file" accept="image/*" capture="camera" onChange={handleImage} style={{margin:'10px 0'}} />
        {image && <img src={image} width="100" style={{borderRadius:'10px'}} />}
        
        <div style={{display:'grid', gap:'10px', marginTop:'20px'}}>
          <button style={{...btn, background:'#22c55e'}} onClick={() => updateStatus("Working")}>Kaam Shuru (9-5)</button>
          <button style={{...btn, background:'#eab308'}} onClick={() => updateStatus("Relaxing")}>Relax Mode</button>
          <button style={{...btn, background:'#ef4444'}} onClick={() => updateStatus("Out")}>Site se Bahar</button>
        </div>
      </div>
    </div>
  );
}

const container = { background: 'linear-gradient(135deg, #667eea, #764ba2)', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' };
const glassCard = { background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', padding: '30px', borderRadius: '20px', color: 'white', textAlign:'center', width:'100%', maxWidth:'400px' };
const input = { width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border:'none' };
const btn = { width: '100%', padding: '12px', border:'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };
