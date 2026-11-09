import React from 'react';
import { 
  X, 
  GraduationCap, 
  ShieldCheck, 
  UserCheck, 
  Sparkles, 
  Lock 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signInWithGoogle, signInAsDemoStudent, signInAsDemoAdmin, isLoading } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div 
        className="w-full max-w-md bg-[#0A192F] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative p-6 pb-4 bg-gradient-to-b from-slate-900 to-[#0A192F] border-b border-slate-800">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <div className="w-full h-full bg-[#0A192F] rounded-[14px] flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-sky-400" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Access ScholarPath</h3>
              <p className="text-xs text-sky-300">Your Future. Your Scholarship. Your Path.</p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-300 leading-relaxed">
            Sign in with your Google account or test immediately with an interactive demo profile. Your academic records are encrypted and saved to your private Firestore account.
          </p>

          {/* Primary Action: Google Sign In */}
          <button
            onClick={async () => {
              await signInWithGoogle();
              onClose();
            }}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition active:scale-[0.98]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-700/80 w-full" />
            <span className="bg-[#0A192F] px-3 text-[11px] uppercase tracking-wider text-slate-400 font-semibold absolute">
              Or Try Instant Demos
            </span>
          </div>

          {/* Quick Demo Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={() => {
                signInAsDemoStudent();
                onClose();
              }}
              className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700 text-left transition group"
            >
              <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs mb-1">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Demo Student</span>
              </div>
              <p className="text-[11px] text-slate-300">
                84% FSc, BS Computer Science student profile.
              </p>
            </button>

            <button
              onClick={() => {
                signInAsDemoAdmin();
                onClose();
              }}
              className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/90 border border-amber-500/30 text-left transition group"
            >
              <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Demo Admin</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Official administrator rights to edit &amp; verify listings.
              </p>
            </button>
          </div>

          {/* Privacy & Safety Note */}
          <div className="pt-2 flex items-start gap-2.5 text-slate-400 text-xs bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <Lock className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-slate-300">Privacy Safeguard</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                ScholarPath never requests CNIC numbers, bank account passwords, or sensitive financial pins.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
