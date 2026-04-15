"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';

export default function Dashboard() {
  const [worker, setWorker] = useState(null);
  const [image, setImage] = useState(null);
  const [currentStatus, setCurrentStatus] = useState("Offline");
  const [lastActionTime, setLastActionTime] = useState(null);

  useEffect(() => {
    const id = localStorage.getItem("workerID");
    if (!id) { window.location.href = "/"; return; }

    const fetchWorker = async () => {
      const docSnap = await getDoc(doc(db, "workers", id));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setWorker(data);
        setCurrentStatus(data.currentStatus || "Offline");
        // Firebase se last update ka time nikalna
        setLastActionTime(data.lastUpdated?.toDate() || new Date());
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

  const updateStatus = async (newStatus) => {
    if (!image) return alert("Pehle Photo lein!");
    
    // Exact location track karne ke liye Geolocation API
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const id = localStorage.getItem("workerID");
      const now = new Date();
      
      // Time Calculation: Kitni der pichle kaam mein tha
      let durationMinutes = 0;
      if (lastActionTime) {
        durationMinutes = Math.round((now - lastActionTime) / 60000); 
      }

      // Naya record jo Admin ko exact location dikhayega
      const logData = {
        fromStatus: currentStatus,
        toStatus: newStatus,
        duration: `${durationMinutes} mins`, 
        time: now.toLocaleTimeString(),
        date: now.toLocaleDateString(),
        photo: image,
        location: { 
          lat: pos.coords.latitude, 
          lng: pos.coords.longitude,
          mapLink: `https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`
        }
      };

      // Firebase mein data save karna
      const workerRef = doc(db, "workers", id);
      
      let updates = {
        currentStatus: newStatus,
        lastUpdated: serverTimestamp(),
        attendanceHistory: arrayUnion(logData)
      };

      // Automatic Time Tracking Logic
      if (currentStatus === "Working") {
        updates.totalWorkMinutes = (worker.totalWorkMinutes || 0) + durationMinutes;
      } else if (currentStatus === "Relaxing") {
        updates.totalRelaxMinutes = (worker.totalRelaxMinutes || 0) + durationMinutes;
      } else if (currentStatus === "Out") {
        // Isse pata chalega ki kitni der "Out" yaani bahar raha
        updates.totalOutMinutes = (worker.totalOutMinutes || 0) + durationMinutes;
      }

      await updateDoc(workerRef, updates);

      setCurrentStatus(newStatus);
      setLastActionTime(now);
      setImage(null);
      alert(`Status: ${newStatus}. Pichli activity ${durationMinutes} mins ki thi.`);
    }, (error) => {
      alert("Location ON kijiye, varna attendance nahi lagegi!");
    }, { enableHighAccuracy: true });
  };

  return (
    <div style={styles.container}>
      <div style={styles.glassCard}>
        <h2 style={styles.title}>MD Jamil Ansari</h2>
        <p>Worker: <strong>{worker?.name}</strong></p>
        
        <div style={{
          ...styles.statusBadge, 
          background: currentStatus === "Working" ? "#22c55e" : currentStatus === "Relaxing" ? "#eab308" : "#ef4444"
        }}>
          Live Status: {currentStatus}
        </div>

        <div style={styles.cameraBox}>
          {image ? <img src={image} style={styles.preview} /> : <div style={styles.placeholder}>📸 Photo Capture</div>}
          <input type="file" accept="image/*" capture="camera" onChange={handleCapture} style={{marginTop:'10px'}} />
        </div>

        <div style={styles.btnGroup}>
          <button style={{...styles.btn, background:'#22c55e'}} onClick={() => updateStatus("Working")}>▶️ Start Working</button>
          <button style={{...styles.btn, background:'#eab308'}} onClick={() => updateStatus("Relaxing")}>☕ Take Break</button>
          <button style={{...styles.btn, background:'#ef4444'}} onClick={() => updateStatus("Out")}>🚪 Leave Site (Bahar)</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
    container: { background: 'linear-gradient(135deg, #667eea, #764ba2)', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' },
    glassCard: { background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', padding: '25px', borderRadius: '25px', color: 'white', textAlign: 'center', width: '100%', maxWidth: '400px' },
    statusBadge: { padding: '10px', borderRadius: '10px', marginBottom: '20px', fontWeight: 'bold' },
    cameraBox: { background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '15px', marginBottom: '20px' },
    preview: { width: '100%', borderRadius: '10px' },
    placeholder: { height: '80px', display:'flex', alignItems:'center', justifyContent:'center', border:'1px dashed #fff' },
    btnGroup: { display: 'flex', flexDirection: 'column', gap: '10px' },
    btn: { padding: '15px', border: 'none', borderRadius: '12px', color: 'white', fontWeight: 'bold', cursor: 'pointer' }
};
