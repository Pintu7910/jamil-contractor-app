"use client";
import { auth, provider } from '@/lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (error) {
      console.error("Login Error:", error);
      alert("Login failed. Please try again.");
    }
  };

  return (
    <div style={{
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'sans-serif',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        width: '100%',
        maxWidth: '400px',
        padding: '40px 30px',
        borderRadius: '24px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        textAlign: 'center',
        border: '1px solid #e2e8f0'
      }}>
        
        {/* Branding Area */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{
            background: '#1e293b',
            color: 'white',
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: 'bold',
            margin: '0 auto 15px'
          }}>M</div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', margin: '0 0 5px 0' }}>
            MD JAMIL <span style={{ color: '#2563eb' }}>ANSARI</span>
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', fontWeight: '500', margin: '0' }}>
            Workforce Management System
          </p>
        </div>

        {/* Action Area */}
        <div style={{ 
          backgroundColor: '#f1f5f9', 
          padding: '25px', 
          borderRadius: '18px',
          marginBottom: '20px' 
        }}>
          <h2 style={{ fontSize: '18px', color: '#334155', marginBottom: '20px', fontWeight: '600' }}>
            Secure Access Portal
          </h2>
          
          <button 
            onClick={handleLogin}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              padding: '12px',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <img 
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/action/google.svg" 
              alt="Google" 
              style={{ width: '20px', height: '20px' }} 
            />
            <span style={{ fontWeight: '600', color: '#334155' }}>Login with Google</span>
          </button>
        </div>

        {/* Footer */}
        <p style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.5' }}>
          Authorized access only. By logging in, you agree to our site terms.<br />
          <strong>© 2026 Jamil Contractor App</strong>
        </p>
      </div>
    </div>
  );
}
