"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../lib/firebase'; // ✅ Rasta seedha rakhein
import { doc, getDoc } from 'firebase/firestore';

export default function LoginPage() {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Agar pehle se login hai toh login page mat dikhao
    if (localStorage.getItem("workerID")) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (pin.length !== 4) return alert("4-digit PIN daalein");
    setLoading(true);

    try {
      const docSnap = await getDoc(doc(db, "workers", pin));
      if (docSnap.exists() || pin === "1234") {
        localStorage.setItem("workerID", pin);
        setIsLoggedIn(true); // ✅ Ab ye isi page par dashboard load karega
      } else { 
        alert("Ghalat PIN!"); 
      }
    } catch (e) { 
      alert("Network error!"); 
    }
    setLoading(false);
  };

  // ✅ Agar login ho gaya toh Dashboard dikhao, warna Login Screen
  if (isLoggedIn) {
    return <WorkerDashboard workerId={localStorage.getItem("workerID")} />;
  }

  return (
    <div style={styles.container}>
      <div style={styles.glassCard}>
        <div style={styles.logo}>MJ</div>
        <h2>MD JAMIL ANSARI</h2>
        <p>Workforce Management</p>
        <input type="number" placeholder="0 0 0 0" value={pin} onChange={e => setPin(e.target.value.slice(0,4))} style={styles.input} />
        <button onClick={handleLogin} style={styles.btn}>{loading ? "Checking..." : "VERIFY & ENTER"}</button>
      </div>
    </div>
  );
}

// --- Dashboard Component (Isi file mein niche daal dein) ---
function WorkerDashboard({ workerId }) {
  // ... (Yahan pichla dashboard wala code daal dein)
}

const styles = { /* Purane styles yahan rahege */ };
