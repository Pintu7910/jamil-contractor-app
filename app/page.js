"use client";
import { auth, provider } from '@/lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Briefcase, Building2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      // Login success, ab hum dashboard par bhejenge (check hone ke baad)
      router.push('/verify');
    } catch (error) {
      console.error("Login Error:", error);
      alert("Login failed. Please check your credentials and try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 font-sans antialiased text-slate-800">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/absurdity.png')] pointer-events-none"></div>

      {/* Main Container */}
      <div className="z-10 w-full max-w-lg p-8 space-y-12 text-center bg-white border border-slate-100 shadow-2xl rounded-3xl backdrop-blur-sm">
        
        {/* Company Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center p-4 bg-slate-900 text-white rounded-full shadow-lg">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-950 tracking-tight">
            MD JAMIL <span className="text-blue-700">ANSARI</span>
          </h1>
          <p className="text-xl text-slate-600 font-medium">Contractor Workforce Management</p>
          <p className="text-sm text-slate-400">Trusted solutions for manpower & site logs.</p>
        </div>

        {/* Login Form Section */}
        <div className="space-y-8 bg-slate-100 p-10 rounded-2xl border border-slate-200">
          <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Secure Access Portal</h2>
          
          <button 
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-4 bg-white border border-slate-300 p-4 rounded-xl hover:bg-white hover:border-slate-400 hover:shadow-md active:scale-[0.98] transition-all duration-150 ease-in-out group"
          >
            {/* Using a stable SVG link for Google Icon */}
            <img 
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/action/google.svg" 
              alt="Google Icon" 
              className="w-6 h-6" 
            />
            <span className="font-bold text-lg text-slate-800">Login with Google</span>
          </button>
          
          <div className="text-xs text-slate-500 mt-6 pt-6 border-t border-slate-200">
            For MD Jamil Ansari's authorized workers and admin only.
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-slate-400 mt-16 pt-8 border-t border-slate-100">
          © 2026 Jamil Contractor App. All Rights Reserved. Development by Sadiya B.
        </div>
      </div>
    </div>
  );
}
