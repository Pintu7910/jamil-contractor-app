"use client";
import { auth, provider } from '@/lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      // Login ke baad verify page par bhej rahe hain
      router.push('/verify');
    } catch (error) {
      console.error("Login Error:", error);
      alert("Login failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-blue-900 mb-2 text-center">
        MD JAMIL ANSARI
      </h1>
      <p className="text-gray-600 mb-8 font-medium italic">Contractor Workforce System</p>
      
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
        <h2 className="text-xl mb-6 font-semibold">Welcome Back</h2>
        <button 
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 p-3 rounded-lg hover:bg-gray-50 transition-all shadow-sm"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/action/google.svg" alt="Google" className="w-5" />
          <span className="font-bold text-gray-700">Login with Google</span>
        </button>
      </div>
      <p className="mt-10 text-xs text-gray-400">© 2026 Jamil Contractor App</p>
    </div>
  );
}
