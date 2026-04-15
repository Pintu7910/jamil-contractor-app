"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';

export default function Dashboard() {
  const [worker, setWorker] = useState(null);
  const [image, setImage] = useState(null);
  const [currentStatus, setCurrentStatus] = useState("Offline");

  useEffect(() => {
    const id = localStorage.getItem("workerID");
    if (!id) { window.location.href = "/"; return; }

    const fetchWorker = async () => {
      const docSnap = await getDoc(doc(db, "workers", id));
      if (docSnap.exists()) {
        setWorker(docSnap.data());
        setCurrentStatus(docSnap.data().currentStatus || "Offline");
      }
    };
    fetchWorker();
  }, []);

  const handleCapture = (e) => {
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
        setImage(canvas.toDataURL('image/jpeg', 0.5));
      };
    };
  };

  const updateStatus = async (statusName) => {
    if (!image) return alert("Pehle Photo lein!");
    
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const id = localStorage.getItem("workerID");
      const timeNow = new Date().toLocaleTimeString();
      
      const logData = {
        status: statusName,
        time: timeNow,
        date: new Date().toLocaleDateString(),
        photo: image,
        location: { lat: pos.coords.latitude, lng: pos.coords.longitude }
      };

      // Firebase mein "Live Status" update karna
      await updateDoc(doc(db, "workers", id), {
        currentStatus: statusName, // Yeh automatic admin ko dikhayega
        lastUpdated: serverTimestamp(),
        attendanceHistory: arrayUnion(logData)
      });

      setCurrentStatus(statusName);
      setImage(null);
      alert(`Status badal kar ${statusName} ho gaya hai!`);
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.glassCard}>
        <h2 style={styles.title}>MD Jamil Ansari</h2>
        <p>Worker: <strong>{worker?.name}</strong></p>
        
        {/* Live Status Indicator */}
        <div style={{...styles.statusBadge, background: currentStatus === "Working" ? "#22c55e" : "#ef4444"}}>
          Abhi Ka Status: {currentStatus}
        </div>

        <div style={styles.cameraBox}>
          {image ? <img src={image} style={styles.preview} /> : <div style={styles.placeholder}>📸 Photo Zaruri Hai</div>}
          <input type="file" accept="image/*" capture="camera" onChange={handleCapture} style={{marginTop:'10px'}} />
        </div>

        <div style={styles.btnGroup}>
          <button style={{...styles.btn, background:'#22c55e'}} onClick={() => updateStatus("Working")}>▶️ Kaam Shuru</button>
          <button style={{...styles.btn, background:'#eab308'}} onClick={() => updateStatus("Relaxing")}>☕ Aaram (Break)</button>
          <button style={{...styles.btn, background:'#ef4444'}} onClick={() => updateStatus("Out")}>🚪 Bahar Gaya (Exit)</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { background: 'linear-gradient(135deg, #667eea, #764ba2)', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' },
  glassCard: { background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', padding: '25px', borderRadius: '25px', color: 'white', textAlign: 'center', width: '100%', maxWidth: '400px' },
  statusBadge: { padding: '10px', borderRadius: '10px', marginBottom: '20px', fontWeight: 'bold', fontSize: '14px' },
  cameraBox: { background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '15px', marginBottom: '20px' },
  preview: { width: '100%', borderRadius: '10px' },
  placeholder: { height: '80px', display:'flex', alignItems:'center', justifyContent:'center', border:'1px dashed #fff' },
  btnGroup: { display: 'flex', flexDirection: 'column', gap: '10px' },
  btn: { padding: '15px', border: 'none', borderRadius: '12px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }
};
