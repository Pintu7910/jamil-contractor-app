"use client";
import { useEffect, useState } from 'react';

export default function TestDashboard() {
  const [workerID, setWorkerID] = useState('');

  useEffect(() => {
    // Check karein ki PIN save hua ya nahi
    const id = localStorage.getItem("workerID");
    setWorkerID(id);
  }, []);

  return (
    <div style={{padding: '50px', textAlign: 'center', background: '#f0f0f0', minHeight: '100vh'}}>
      <h1>✅ Dashboard Khul Gaya!</h1>
      <p>Aapka PIN hai: <strong>{workerID}</strong></p>
      <button onClick={() => { localStorage.clear(); window.location.href="/"; }} style={{padding:'10px', marginTop:'20px'}}>
        Logout (Wapas Login par jayein)
      </button>
    </div>
  );
}
