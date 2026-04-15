"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export default function AdminDashboard() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [workers, setWorkers] = useState([]);

  // Admin Login Check
  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminCode === "Jh8323") {
      setIsAdmin(true);
      localStorage.setItem("adminLoggedIn", "true");
    } else {
      alert("Ghalat Admin Code!");
    }
  };

  useEffect(() => {
    // Agar pehle se login hai
    if (localStorage.getItem("adminLoggedIn") === "true") {
      setIsAdmin(true);
    }

    if (isAdmin) {
      // Real-time listener: Workers ka data apne aap update hoga
      const unsub = onSnapshot(collection(db, "workers"), (snap) => {
        setWorkers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
      return () => unsub();
    }
  }, [isAdmin]);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    setIsAdmin(false);
  };

  if (!isAdmin) {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.glassCard}>
          <h2 style={{marginBottom: '20px'}}>Admin Login</h2>
          <form onSubmit={handleAdminLogin}>
            <input 
              type="text" 
              placeholder="Enter Admin Code" 
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              style={styles.input}
            />
            <button type="submit" style={styles.loginBtn}>ENTER DASHBOARD</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.dashboardContainer}>
      <header style={styles.header}>
        <div>
          <h1 style={{margin: 0, fontSize: '20px'}}>MD Jamil Ansari</h1>
          <p style={{margin: 0, fontSize: '12px', opacity: 0.8}}>Workforce Management System</p>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </header>

      <div style={styles.statsRow}>
        <div style={styles.statBox}>
          <h3>{workers.length}</h3>
          <p>Total Workers</p>
        </div>
        <div style={styles.statBox}>
          <h3>{workers.filter(w => w.currentStatus?.includes("WORKING")).length}</h3>
          <p>On Site</p>
        </div>
      </div>

      <h3 style={{margin: '20px 0 10px'}}>Live Tracking</h3>
      
      <div style={styles.workerList}>
        {workers.map(w => (
          <div key={w.id} style={styles.workerCard}>
            <div style={styles.workerInfo}>
              <h4 style={{margin: '0 0 5px'}}>{w.name || "Unknown Worker"}</h4>
              <p style={styles.subText}>PIN: {w.id}</p>
              <p style={styles.subText}>
                Last Seen: {w.lastSeen ? w.lastSeen.toDate().toLocaleTimeString() : "Never"}
              </p>
            </div>

            <div style={{textAlign: 'right'}}>
              <span style={{
                ...styles.statusBadge,
                background: w.currentStatus?.includes("WORKING") ? "#dcfce7" : "#fee2e2",
                color: w.currentStatus?.includes("WORKING") ? "#166534" : "#991b1b"
              }}>
                {w.currentStatus || "Offline"}
              </span>
              
              <a 
                href={`https://www.google.com/maps?q=${w.lastLocation?.lat},${w.lastLocation?.lng}`} 
                target="_blank" 
                style={styles.mapLink}
              >
                📍 Live Location
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  loginContainer: { background: 'linear-gradient(135deg, #667eea, #764ba2)', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' },
  dashboardContainer: { padding: '20px', maxWidth: '600px', margin: '0 auto', background: '#f8f9fa', minHeight: '100vh' },
  glassCard: { background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', padding: '30px', borderRadius: '20px', textAlign: 'center', color: 'white', width: '100%', maxWidth: '350px' },
  input: { width: '100%', padding: '12px', borderRadius: '8px', border: 'none', marginBottom: '15px', textAlign: 'center', fontSize: '18px' },
  loginBtn: { width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: '#fff', color: '#667eea', fontWeight: 'bold', cursor: 'pointer' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#764ba2', color: 'white', borderRadius: '12px', marginBottom: '20px' },
  logoutBtn: { background: 'rgba(255,255,255,0.2)', border: '1px solid white', color: 'white', padding: '5px 10px', borderRadius: '6px', fontSize: '12px' },
  statsRow: { display: 'flex', gap: '10px', marginBottom: '20px' },
  statBox: { flex: 1, background: 'white', padding: '15px', borderRadius: '12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  workerList: { display: 'grid', gap: '12px' },
  workerCard: { background: 'white', padding: '15px', borderRadius: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
  statusBadge: { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', display: 'inline-block' },
  mapLink: { display: 'block', marginTop: '10px', fontSize: '12px', color: '#667eea', textDecoration: 'none', fontWeight: 'bold' },
  subText: { fontSize: '11px', color: '#888', margin: '2px 0' }
};
