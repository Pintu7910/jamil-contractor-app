"use client";
import { auth, provider } from '@/lib/firebase';
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [status, setStatus] = useState({ msg: '', type: '' }); // { msg: 'Login Success', type: 'success' }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/dashboard');
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Message ko 3 second baad hatane ke liye
  useEffect(() => {
    if (status.msg) {
      const timer = setTimeout(() => setStatus({ msg: '', type: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleLogin = async () => {
    try {
      setStatus({ msg: 'Connecting to Google...', type: 'info' });
      const result = await signInWithPopup(auth, provider);
      
      if (result.user) {
        setStatus({ msg: 'Login Successful! Redirecting...', type: 'success' });
        setTimeout(() => router.push('/dashboard'), 1000);
      }
    } catch (error) {
      console.error("Login Error:", error);
      setStatus({ msg: 'Login Failed! Please try again.', type: 'error' });
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Segoe UI', Roboto, sans-serif",
      padding: '20px',
      position: 'relative'
    }}>
      
      {/* Notification Toast */}
      {status.msg && (
        <div style={{
          position: 'absolute',
          top: '20px',
          padding: '12px 24px',
          borderRadius: '12px',
          backgroundColor: status.type === 'success' ? '#22c55e' : status.type === 'error' ? '#ef4444' : '#3b82f6',
          color: 'white',
          fontWeight: '600',
          boxShadow: '0 10px 15px rgba(0,0,0,0.2)',
          zIndex: 100,
          animation: 'slideDown 0.5s ease-out'
        }}>
          {status.msg}
        </div>
      )}

      {/* Glass Card */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(15px)',
        WebkitBackdropFilter: 'blur(15px)',
        borderRadius: '32px',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        width: '100%',
        maxWidth: '400px',
        padding: '50px 30px',
        textAlign: 'center',
        color: '#fff'
      }}>
        
        <div style={{ marginBottom: '40px' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            width: '70px',
            height: '70px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            border: '1px solid rgba(255, 255, 255, 0.4)'
          }}>
            <span style={{ fontSize: '30px', fontWeight: 'bold' }}>MJ</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: '700', letterSpacing: '1px' }}>MD JAMIL ANSARI</h1>
          <p style={{ fontSize: '14px', opacity: '0.8', marginTop: '8px' }}>Workforce Management System</p>
        </div>

        <div style={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          padding: '25px', 
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <button 
            onClick={handleLogin}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              backgroundColor: '#fff',
              border: 'none',
              padding: '14px',
              borderRadius: '16px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              color: '#444'
            }}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/action/google.svg" alt="G" style={{ width: '22px' }} />
            Login with Google
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from { transform: translateY(-50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
