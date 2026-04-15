"use client";
import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { Play, Coffee, LogOut, MapPin } from 'lucide-react';

export default function WorkerPortal() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
      else router.push('/');
    });
    return () => unsubscribe();
  }, [router]);

  const updateStatus = async (status) => {
    if (!user) return;
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          // 'setDoc' with merge use karna behtar hai agar document pehle se na ho
          const workerRef = doc(db, "live_tracking", user.uid);
          await setDoc(workerRef, {
            workerName: user.displayName,
            workerEmail: user.email,
            currentStatus: status,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            lastUpdated: serverTimestamp()
          }, { merge: true });

          alert(`Status: ${status} updated successfully!`);
        } catch (error) {
          console.error("Error updating status:", error);
          alert("Firestore Error: " + error.message);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        setLoading(false);
        alert("Please enable Location/GPS to update status.");
      }
    );
  };

  if (!user) return <div style={{color: 'white', textAlign: 'center', marginTop: '50px'}}>Loading...</div>;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'sans-serif',
      color: 'white'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(10px)',
        borderRadius: '24px',
        padding: '30px',
        maxWidth: '500px',
        margin: '0 auto',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px' }}>Worker Dashboard</h1>
        <p style={{ opacity: 0.8, marginBottom: '30px' }}>Welcome, {user.displayName}</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <button 
            disabled={loading}
            onClick={() => updateStatus("Working")} 
            style={{ ...buttonStyle, backgroundColor: '#22c55e' }}
          >
            <Play size={20} /> Kaam Shuru (Check-In)
          </button>

          <button 
            disabled={loading}
            onClick={() => updateStatus("Relaxing")} 
            style={{ ...buttonStyle, backgroundColor: '#eab308' }}
          >
            <Coffee size={20} /> Aaram (Break)
          </button>

          <button 
            disabled={loading}
            onClick={() => updateStatus("Out")} 
            style={{ ...buttonStyle, backgroundColor: '#ef4444' }}
          >
            <LogOut size={20} /> Site Se Bahar (Exit)
          </button>
        </div>

        {loading && <p style={{ marginTop: '20px', fontSize: '14px' }}>Updating location... 📍</p>}
      </div>
    </div>
  );
}

const buttonStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  color: 'white',
  padding: '16px',
  borderRadius: '16px',
  border: 'none',
  fontSize: '16px',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: 'transform 0.1s'
};
