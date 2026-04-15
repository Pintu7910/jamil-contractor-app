"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function LoginPage() {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem("workerID")) router.push('/dashboard');
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (pin.length !== 4) return alert("4-digit PIN daalein");
    setLoading(true);

    if (pin === "1234") {
      localStorage.setItem("workerID", "1234");
      router.push('/dashboard');
      return;
    }

    try {
      const docSnap = await getDoc(doc(db, "workers", pin));
      if (docSnap.exists()) {
        localStorage.setItem("workerID", pin);
        router.push('/dashboard');
      } else { alert("Ghalat PIN!"); }
    } catch (e) { alert("Network error!"); }
    setLoading(false);
  };

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

const styles = {
  container: { background: 'linear-gradient(135deg, #667eea, #764ba2)', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  glassCard: { background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', padding: '40px', borderRadius: '25px', textAlign: 'center', color: 'white' },
  input: { width: '100%', padding: '15px', fontSize: '24px', textAlign: 'center', borderRadius: '10px', border: 'none', marginBottom: '20px' },
  btn: { width: '100%', padding: '15px', borderRadius: '10px', border: 'none', background: '#fff', color: '#667eea', fontWeight: 'bold' },
  logo: { width: '70px', height: '70px', background: 'rgba(255,255,255,0.3)', borderRadius: '50%', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }
};
