import React, { useState } from 'react';
import { 
  Bell, 
  X, 
  Clock, 
  Sparkles, 
  CheckCheck, 
  Trash2, 
  ExternalLink, 
  AlertTriangle,
  CheckCircle2,
  Settings,
  ChevronRight,
  ShieldCheck,
  Send
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { AppNotification } from '../../types/notification';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScholarship?: (scholarshipId: string) => void;
  onNavigateToTab?: (tab: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onSelectScholarship,
  onNavigateToTab,
}) => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    clearNotification, 
    clearAllNotifications,
    browserPermission,
    requestBrowserPermission,
    triggerSampleDeadlineToast,
    triggerSampleMatchToast
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState<'all' | 'deadlines' | 'matches'>('all');

  if (!isOpen) return null;

  const filtered = notifications.filter((n) => {
    if (activeFilter === 'deadlines') return n.type === 'deadline_urgent';
    if (activeFilter === 'matches') return n.type === 'matching_scholarship';
    return true;
  });

  const handleItemClick = (n: AppNotification) => {
    markAsRead(n.id);
    if (n.scholarshipId && onSelectScholarship) {
      onSelectScholarship(n.scholarshipId);
      onClose();
    } else if (n.actionTab && onNavigateToTab) {
      onNavigateToTab(n.actionTab);
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity"
      />

      {/* Slide-over Drawer */}
      <aside 
        className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-[#0A192F] border-l border-slate-800 shadow-2xl flex flex-col justify-between text-slate-100 animate-in slide-in-from-right duration-200"
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-800 bg-[#081324] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">Alerts &amp; Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-600 text-white">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Deadlines within 7 days &amp; profile match alerts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar & Quick Controls */}
        <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-900/50 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                activeFilter === 'all' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setActiveFilter('deadlines')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                activeFilter === 'deadlines' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Deadlines ≤7d
            </button>
            <button
              onClick={() => setActiveFilter('matches')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                activeFilter === 'matches' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Matches
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-[11px] text-sky-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {/* Browser Push Permission Banner (if not yet granted) */}
        {browserPermission !== 'granted' && (
          <div className="m-4 p-3.5 rounded-2xl bg-sky-950/40 border border-sky-800/60 flex items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-sky-300 block">Enable Browser Push Alerts</span>
              <p className="text-[11px] text-slate-400">
                Receive background alerts when scholarships approach their 7-day deadlines.
              </p>
            </div>
            <button
              onClick={requestBrowserPermission}
              className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shrink-0 transition"
            >
              Enable
            </button>
          </div>
        )}

        {/* Notifications Scroll List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-2 border border-dashed border-slate-800 rounded-2xl">
              <Bell className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs font-semibold text-slate-300">No Notifications in this filter</p>
              <p className="text-[11px] text-slate-500">
                You will be notified automatically when scholarships reach 7 days before deadline or match your target country.
              </p>
            </div>
          ) : (
            filtered.map((item) => {
              const isUrgent = item.type === 'deadline_urgent';
              const isMatch = item.type === 'matching_scholarship';

              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer relative group flex items-start gap-3 ${
                    !item.read
                      ? isUrgent
                        ? 'bg-[#141E33] border-amber-500/50 hover:border-amber-400'
                        : 'bg-[#10243E] border-sky-500/50 hover:border-sky-400'
                      : 'bg-slate-900/60 border-slate-800/90 hover:bg-slate-800/60'
                  }`}
                >
                  {/* Icon */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    isUrgent
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : isMatch
                      ? 'bg-sky-950 text-sky-300 border border-sky-800'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {isUrgent ? <Clock className="w-4 h-4" /> : isMatch ? <Sparkles className="w-4 h-4" /> : <Bell className="w-4 h-4" />}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-bold text-white text-xs truncate">
                          {item.title}
                        </span>
                        {!item.read && (
                          <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0" />
                        )}
                      </div>

                      {item.badge && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border shrink-0 ${
                          isUrgent ? 'bg-rose-950 text-rose-300 border-rose-800' : 'bg-sky-950 text-sky-300 border-sky-800'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {item.message}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                      <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="text-sky-400 group-hover:underline flex items-center gap-0.5 font-medium">
                        <span>Take action</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearNotification(item.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition"
                    title="Delete notification"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Bottom Controls & Interactive Simulator */}
        <div className="p-4 border-t border-slate-800 bg-[#081324] space-y-3">
          
          {/* Simulator Bar */}
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Simulate Instant Notifications
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={triggerSampleDeadlineToast}
                className="px-2.5 py-2 rounded-xl bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-800 font-bold text-[11px] flex items-center justify-center gap-1.5 transition"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Test 7-Day Alert</span>
              </button>

              <button
                onClick={triggerSampleMatchToast}
                className="px-2.5 py-2 rounded-xl bg-sky-950/80 hover:bg-sky-900 text-sky-300 border border-sky-800 font-bold text-[11px] flex items-center justify-center gap-1.5 transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Test Match Alert</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <div className="flex items-center gap-1.5 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>Real-time deadline watcher</span>
            </div>

            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="text-rose-400 hover:underline text-[11px]"
              >
                Clear all history
              </button>
            )}
          </div>
        </div>

      </aside>
    </>
  );
};
