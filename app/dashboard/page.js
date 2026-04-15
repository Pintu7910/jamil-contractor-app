"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';

export default function Dashboard() {
  const [worker, setWorker] = useState(null);
  const [image, setImage] = useState(null);

  useEffect(() => {
    const id = localStorage.getItem("workerID");
    if (!id) window.location.href = "/";
    getDoc(doc(db, "workers", id)).then(s => setWorker(s.data()));
  }, []);

  const compressImage = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (ev) => {
      const img = new Image();
      img.src = ev.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 300; canvas.height = 300;
        canvas.getContext('2d').drawImage(img, 0, 0, 300, 300);
        setImage(canvas.toDataURL('image/jpeg', 0.6));
      };
    };
  };

  const syncAttendance = async (status) => {
    if (!image) return alert("Pehle site ki photo lein!");
    navigator.geolocation.getCurrentPosition(async (pos) => {
      await updateDoc(doc(db, "workers", localStorage.getItem("workerID")), {
        currentStatus: status,
        attendance: arrayUnion({
          status, image, 
          time: new Date().toISOString(),
          lat: pos.coords.latitude, lng: pos.coords.longitude,
          approved: false
        })
      });
      alert(status + " synced!");
    });
  };

  if (!worker) return <p>Loading...</p>;

  return (
    <div style={styles.container}>
      <div style={styles.glassCard}>
        <h3>Welcome, {worker.name}</h3>
        <input type="file" accept="image/*" capture="camera" onChange={compressImage} />
        {image && <img src={image} width="100" style={{marginTop:'10px'}} />}
        <button onClick={() => syncAttendance("Working")} style={{...styles.btn, background:'#22c55e'}}>Kaam Shuru (9-5)</button>
        <button onClick={() => syncAttendance("Relaxing")} style={{...styles.btn, background:'#eab308'}}>Aaram (Break)</button>
        <button onClick={() => syncAttendance("Out")} style={{...styles.btn, background:'#ef4444'}}>Site Se Bahar</button>
        <button onClick={() => {localStorage.clear(); window.location.href="/"}} style={{marginTop:'20px'}}>Logout</button>
      </div>
    </div>
  );
}

const styles = {
  container: { background: 'linear-gradient(135deg, #667eea, #764ba2)', minHeight: '100vh', padding: '20px' },
  glassCard: { background: 'rgba(255,255,255,0.2)', padding: '20px', borderRadius: '20px', color: 'white', textAlign: 'center' },
  btn: { width: '100%', padding: '15px', margin: '10px 0', borderRadius: '12px', border: 'none', color: 'white', fontWeight: 'bold' }
};
