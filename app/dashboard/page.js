"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';

export default function AutomaticDashboard() {
  const [worker, setWorker] = useState(null);
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState("Checking...");

  // SITE KI LOCATION (Example: Jamshedpur Site)
  const SITE_LAT = 22.8046; 
  const SITE_LNG = 86.2029;

  useEffect(() => {
    const id = localStorage.getItem("workerID");
    if (!id) { window.location.href = "/"; return; }

    getDoc(doc(db, "workers", id)).then(s => setWorker(s.data()));

    // AUTOMATIC TRACKING LOGIC (Har 10 minute mein check karega)
    const interval = setInterval(() => {
      trackWorker(id);
    }, 600000); 

    return () => clearInterval(interval);
  }, []);

  const trackWorker = (id) => {
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      
      // Distance calculate karne ka formula
      const dist = Math.sqrt(Math.pow(latitude - SITE_LAT, 2) + Math.pow(longitude - SITE_LNG, 2));
      
      // Agar 0.002 se zyada hai (~200 meters), toh "OUT"
      const newStatus = dist > 0.002 ? "OUT (Bahar Gaya)" : "WORKING (Site Pe Hai)";
      
      await updateDoc(doc(db, "workers", id), {
        currentStatus: newStatus,
        lastLocation: { lat: latitude, lng: longitude },
        lastSeen: serverTimestamp()
      });
      setStatus(newStatus);
    }, null, { enableHighAccuracy: true });
  };

  const handleInitialPhoto = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (ev) => {
      setImage(ev.target.result);
      alert("Photo Saved! Ab system automatic track karega.");
      trackWorker(localStorage.getItem("workerID"));
    };
  };

  return (
    <div style={styles.container}>
      <div style={styles.glassCard}>
        <h2>MD Jamil Ansari</h2>
        <p>Worker: <strong>{worker?.name}</strong></p>
        
        <div style={{...styles.status, background: status.includes("WORKING") ? "#22c55e" : "#ef4444"}}>
          LIVE: {status}
        </div>

        {!image ? (
          <div style={styles.cameraBox}>
            <p>Subah ki ek photo lein:</p>
            <input type="file" accept="image/*" capture="camera" onChange={handleInitialPhoto} />
          </div>
        ) : (
          <p style={{color: '#fff'}}>✅ Automatic Tracking Active</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { background: 'linear-gradient(135deg, #667eea, #764ba2)', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' },
  glassCard: { background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', padding: '30px', borderRadius: '25px', color: 'white', textAlign: 'center', width: '100%', maxWidth: '400px' },
  status: { padding: '15px', borderRadius: '12px', margin: '20px 0', fontWeight: 'bold' },
  cameraBox: { border: '2px dashed #fff', padding: '20px', borderRadius: '15px' }
};
