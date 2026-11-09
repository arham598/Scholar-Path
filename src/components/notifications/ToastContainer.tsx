import React, { useEffect } from 'react';
import { 
  AlertTriangle, 
  Sparkles, 
  Clock, 
  X, 
  ArrowRight, 
  Bell, 
  Info,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { ToastItem } from '../../types/notification';

interface ToastContainerProps {
  onOpenScholarshipDetails?: (scholarshipId: string) => void;
  onNavigateToTab?: (tab: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  onOpenScholarshipDetails,
  onNavigateToTab,
}) => {
  const { toasts, dismissToast, markAsRead } = useNotifications();

  return (
    <div 
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full px-4 sm:px-0 pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <ToastCard
          key={toast.id}
          toast={toast}
          onDismiss={() => dismissToast(toast.id)}
          onAction={() => {
            markAsRead(toast.id);
            dismissToast(toast.id);
            if (toast.scholarshipId && onOpenScholarshipDetails) {
              onOpenScholarshipDetails(toast.scholarshipId);
            } else if (toast.actionTab && onNavigateToTab) {
              onNavigateToTab(toast.actionTab);
            }
          }}
        />
      ))}
    </div>
  );
};

const ToastCard: React.FC<{
  toast: ToastItem;
  onDismiss: () => void;
  onAction: () => void;
}> = ({ toast, onDismiss, onAction }) => {
  const isUrgentDeadline = toast.type === 'deadline_urgent';
  const isMatch = toast.type === 'matching_scholarship';

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, toast.duration || 7000);

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  return (
    <div
      className={`pointer-events-auto rounded-2xl shadow-2xl p-4 border transition-all duration-300 transform translate-y-0 opacity-100 flex flex-col gap-2.5 backdrop-blur-md ${
        isUrgentDeadline
          ? 'bg-[#0E1A2E]/95 border-amber-500/60 shadow-amber-950/40'
          : isMatch
          ? 'bg-[#0A1D36]/95 border-sky-500/60 shadow-sky-950/40'
          : 'bg-[#0A192F]/95 border-slate-700/80 shadow-slate-950/40'
      }`}
    >
      {/* Toast Top Bar */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {isUrgentDeadline ? (
            <div className="w-7 h-7 rounded-lg bg-rose-950/90 border border-rose-800 text-rose-300 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 animate-pulse" />
            </div>
          ) : isMatch ? (
            <div className="w-7 h-7 rounded-lg bg-sky-950/90 border border-sky-800 text-sky-300 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0">
              <Bell className="w-4 h-4" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-1.5">
              <h5 className="font-bold text-white text-xs tracking-tight line-clamp-1">
                {toast.title}
              </h5>
              {toast.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                    isUrgentDeadline
                      ? 'bg-rose-950 text-rose-300 border-rose-800'
                      : 'bg-sky-950 text-sky-300 border-sky-800'
                  }`}
                >
                  {toast.badge}
                </span>
              )}
            </div>
            {toast.destinationFlag && (
              <span className="text-[10px] text-slate-400">
                {toast.destinationFlag} {toast.scholarshipName || 'Scholarship Alert'}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss();
          }}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/80 transition"
          aria-label="Dismiss toast notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Toast Message */}
      <p className="text-xs text-slate-200 leading-relaxed pl-9">
        {toast.message}
      </p>

      {/* Toast Footer Action */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 pl-9">
        <span className="text-[10px] text-slate-400">Just now</span>

        <button
          onClick={onAction}
          className={`text-xs font-bold inline-flex items-center gap-1 transition ${
            isUrgentDeadline
              ? 'text-amber-300 hover:text-amber-200'
              : 'text-sky-300 hover:text-sky-200'
          }`}
        >
          <span>{isUrgentDeadline ? 'View Deadline' : 'Check Opportunity'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
