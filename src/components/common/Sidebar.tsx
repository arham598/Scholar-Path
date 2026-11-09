import React from 'react';
import { 
  LayoutDashboard, 
  Search, 
  User, 
  Sparkles, 
  FileEdit, 
  FolderCheck, 
  Calendar, 
  ShieldCheck,
  ChevronRight,
  Globe2,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type NavigationTab = 
  | 'dashboard'
  | 'finder'
  | 'profile'
  | 'eligibility'
  | 'assistant'
  | 'documents'
  | 'deadlines'
  | 'admin';

interface SidebarProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  savedCount?: number;
  documentsMissingCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isMobileOpen,
  onCloseMobile,
  savedCount = 0,
  documentsMissingCount = 0,
}) => {
  const { isAdmin } = useAuth();

  const navItems = [
    {
      id: 'dashboard' as NavigationTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
      description: 'Overview & matched opportunities',
    },
    {
      id: 'finder' as NavigationTab,
      label: 'Scholarship Directory',
      icon: Search,
      badge: '13+ verified',
      description: 'Pakistan & international scholarships',
    },
    {
      id: 'profile' as NavigationTab,
      label: 'Student Profile',
      icon: User,
      badge: 'Single Entry',
      description: 'Academic records & preferences',
    },
    {
      id: 'eligibility' as NavigationTab,
      label: 'AI Eligibility Checker',
      icon: Sparkles,
      badge: 'AI Powered',
      description: 'Match criteria & gap analysis',
    },
    {
      id: 'assistant' as NavigationTab,
      label: 'AI Application Assistant',
      icon: FileEdit,
      badge: 'Drafts',
      description: 'Motivation letters, SOPs & emails',
    },
    {
      id: 'documents' as NavigationTab,
      label: 'Document Checklist',
      icon: FolderCheck,
      badge: documentsMissingCount > 0 ? `${documentsMissingCount} Pending` : 'Tracked',
      badgeColor: documentsMissingCount > 0 ? 'bg-amber-900/60 text-amber-300 border-amber-700/50' : 'bg-emerald-950 text-emerald-300 border-emerald-800',
      description: 'IBCC, HEC, passport & transcripts',
    },
    {
      id: 'deadlines' as NavigationTab,
      label: 'Deadline Tracker',
      icon: Calendar,
      badge: savedCount > 0 ? `${savedCount} Saved` : null,
      description: 'Application countdown & calendar',
    },
  ];

  if (isAdmin) {
    navItems.push({
      id: 'admin' as NavigationTab,
      label: 'Admin Console',
      icon: ShieldCheck,
      badge: 'Official',
      badgeColor: 'bg-amber-900/60 text-amber-300 border-amber-700/50',
      description: 'Verify & manage scholarship data',
    });
  }

  const handleSelect = (id: NavigationTab) => {
    onTabChange(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed md:sticky top-0 md:top-16 z-50 md:z-20 h-full md:h-[calc(100vh-4rem)] w-72 bg-[#081224] border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Navigation Header (Mobile only) */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-[#0A192F]">
          <div className="flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-sky-400" />
            <span className="font-bold text-base text-white">ScholarPath Menu</span>
          </div>
          <button 
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items List */}
        <div className="p-3.5 space-y-1.5 flex-1 overflow-y-auto">
          <div className="px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Platform Modules
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full group text-left px-3.5 py-3 rounded-xl transition-all flex items-center justify-between ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-600 to-blue-700 text-white shadow-lg shadow-sky-600/20 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-lg transition ${
                    isActive 
                      ? 'bg-white/15 text-white' 
                      : 'bg-slate-800/90 text-slate-400 group-hover:text-sky-400 group-hover:bg-slate-800'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="text-sm truncate">{item.label}</div>
                    <div className={`text-[10px] truncate ${isActive ? 'text-sky-100' : 'text-slate-400'}`}>
                      {item.description}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 pl-1">
                  {item.badge && (
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                      item.badgeColor || (isActive ? 'bg-sky-950/80 text-sky-200 border-sky-400/40' : 'bg-slate-800 text-slate-300 border-slate-700')
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'text-white translate-x-0.5' : 'text-slate-500 opacity-0 group-hover:opacity-100'}`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Trust & Compliance Card */}
        <div className="p-4 border-t border-slate-800/80 bg-[#060D1A]/80">
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Data Assurance</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              ScholarPath uses only published government &amp; university criteria. No fabricated requirements.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
