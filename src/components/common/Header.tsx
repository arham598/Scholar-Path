import React, { useState } from 'react';
import { 
  GraduationCap, 
  Search, 
  User as UserIcon, 
  ShieldCheck, 
  LogOut, 
  Menu, 
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

interface HeaderProps {
  onOpenMobileSidebar: () => void;
  onOpenAuthModal: () => void;
  onOpenNotifications: () => void;
  onSearchQueryChange?: (query: string) => void;
  onNavigateToFinder?: () => void;
  currentActiveTab: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileSidebar,
  onOpenAuthModal,
  onOpenNotifications,
  onSearchQueryChange,
  onNavigateToFinder,
}) => {
  const { user, profile, isAdmin, signOutUser, signInAsDemoAdmin, signInAsDemoStudent } = useAuth();
  const { unreadCount } = useNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchQueryChange) {
      onSearchQueryChange(searchTerm);
    }
    if (onNavigateToFinder) {
      onNavigateToFinder();
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0A192F] text-white border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Mobile Menu & Logo */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onOpenMobileSidebar}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-2.5 cursor-pointer select-none">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-sky-600 to-cyan-400 p-0.5 shadow-lg shadow-sky-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#0A192F] rounded-[10px] flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-sky-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xl tracking-tight text-white font-['Plus_Jakarta_Sans']">
                  Scholar<span className="text-sky-400">Path</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-wider bg-sky-950/80 text-sky-300 border border-sky-800/60 px-1.5 py-0.5 rounded">
                  Global
                </span>
              </div>
              <p className="text-[10px] text-slate-400 -mt-1 hidden sm:block tracking-wide">
                Your Future. Your Scholarship. Your Path.
              </p>
            </div>
          </div>
        </div>

        {/* Middle: Quick Search */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (onSearchQueryChange) onSearchQueryChange(e.target.value);
              }}
              placeholder="Search Pakistan, DAAD, Italy, CSC, Türkiye..."
              className="w-full bg-slate-900/90 text-sm text-slate-200 placeholder-slate-400 pl-10 pr-4 py-2 rounded-xl border border-slate-700/80 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/40 transition"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          </form>
        </div>

        {/* Right: Quick Stats, Admin Badge & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Quick AI badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-950/60 border border-sky-800/50 text-xs text-sky-300">
            <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            <span className="font-medium">AI Eligibility Live</span>
          </div>

          {/* Admin Indicator */}
          {isAdmin && (
            <div className="flex items-center gap-1 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold px-2.5 py-1 rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </div>
          )}

          {/* Notification Bell Button */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white transition active:scale-95"
            aria-label="Open notifications"
            title="View deadline and scholarship match notifications"
          >
            <Bell className="w-4 h-4 text-sky-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 border-2 border-[#0A192F] text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* User Button & Dropdown */}
          <div className="relative">
            {user ? (
              <button 
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-sky-600/30 border border-sky-500/40 flex items-center justify-center text-sky-300 font-bold text-xs uppercase">
                  {profile.fullName ? profile.fullName.charAt(0) : 'U'}
                </div>
                <div className="hidden md:block">
                  <div className="text-xs font-semibold text-white max-w-[120px] truncate leading-tight">
                    {profile.fullName || user.displayName || 'Student'}
                  </div>
                  <div className="text-[10px] text-sky-400/90 flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>{isAdmin ? 'Administrator' : 'Verified Profile'}</span>
                  </div>
                </div>
              </button>
            ) : (
              <button 
                onClick={onOpenAuthModal}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs sm:text-sm shadow-md shadow-sky-600/20 transition active:scale-95"
              >
                <UserIcon className="w-4 h-4" />
                <span>Sign In / Demo</span>
              </button>
            )}

            {/* Dropdown Menu */}
            {showUserDropdown && user && (
              <div 
                className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 text-slate-200"
                onClick={() => setShowUserDropdown(false)}
              >
                <div className="px-4 py-3 border-b border-slate-800">
                  <p className="text-xs text-slate-400">Signed in as</p>
                  <p className="text-sm font-semibold text-white truncate">{profile.fullName || user.email}</p>
                  <p className="text-xs text-sky-400 truncate">{user.email}</p>
                </div>

                <div className="py-1">
                  <div className="px-4 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Quick Role Switch
                  </div>
                  <button 
                    onClick={signInAsDemoStudent}
                    className="w-full text-left px-4 py-2 text-xs hover:bg-slate-800 flex items-center justify-between"
                  >
                    <span>Switch to Student Demo</span>
                    {!isAdmin && <span className="text-[10px] bg-sky-950 text-sky-300 px-1.5 py-0.5 rounded border border-sky-800">Active</span>}
                  </button>
                  <button 
                    onClick={signInAsDemoAdmin}
                    className="w-full text-left px-4 py-2 text-xs hover:bg-slate-800 flex items-center justify-between text-amber-300"
                  >
                    <span>Switch to Admin View</span>
                    {isAdmin && <span className="text-[10px] bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded border border-amber-800">Active</span>}
                  </button>
                </div>

                <div className="border-t border-slate-800 py-1">
                  <button 
                    onClick={() => signOutUser()}
                    className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-950/30 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
