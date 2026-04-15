"use client";
import { auth, provider } from '@/lib/firebase';
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push('/dashboard');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Login failed: " + error.message);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      padding: '20px'
    }}>
      {/* Glass Card */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.15)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderRadius: '32px',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        width: '100%',
        maxWidth: '400px',
        padding: '50px 30px',
        textAlign: 'center',
        color: '#fff'
      }}>
        
        {/* Logo Section */}
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
          <h1 style={{ fontSize: '26px', fontWeight: '700', letterSpacing: '1px', margin: '0' }}>
            MD JAMIL ANSARI
          </h1>
          <p style={{ fontSize: '14px', opacity: '0.8', marginTop: '8px' }}>
            Workforce Management System
          </p>
        </div>

        {/* Login Area */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.1)', 
          padding: '25px', 
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '25px' }}>
            Secure Portal Login
          </h2>
          
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
              transition: 'transform 0.2s, box-shadow 0.2s',
              fontSize: '16px',
              fontWeight: '600',
              color: '#444'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <img 
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/action/google.svg" 
              alt="Google" 
              style={{ width: '22px' }} 
            />
            Login with Google
          </button>
        </div>

        {/* Footer */}
        <p style={{ fontSize: '12px', marginTop: '30px', opacity: '0.6' }}>
          © 2026 Jamil Contractor App <br/>
          Developed by Sadiya
        </p>
      </div>
    </div>
  );
}
