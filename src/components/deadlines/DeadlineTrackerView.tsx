import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  Trash2, 
  Bell, 
  ExternalLink, 
  BookmarkCheck,
  Send,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SavedScholarship, ApplicationStatus, Scholarship } from '../../types/scholarship';
import { scholarshipService } from '../../services/scholarshipService';

interface DeadlineTrackerViewProps {
  scholarships: Scholarship[];
  onNavigateToFinder?: () => void;
  onOpenAssistantForScholarship?: (scholarship: Scholarship) => void;
}

export const DeadlineTrackerView: React.FC<DeadlineTrackerViewProps> = ({
  scholarships,
  onNavigateToFinder,
  onOpenAssistantForScholarship,
}) => {
  const { user } = useAuth();
  const [savedItems, setSavedItems] = useState<SavedScholarship[]>(
    scholarshipService.getLocalSavedScholarships()
  );
  const [reminderEmail, setReminderEmail] = useState<string>(user?.email || 'student@example.pk');
  const [reminderNotice, setReminderNotice] = useState<string | null>(null);

  const handleStatusChange = async (scholarshipId: string, status: ApplicationStatus) => {
    await scholarshipService.updateSavedScholarshipStatus(user?.uid || 'demo-user', scholarshipId, status);
    setSavedItems(scholarshipService.getLocalSavedScholarships());
  };

  const handleRemove = async (scholarshipId: string) => {
    await scholarshipService.removeSavedScholarship(user?.uid || 'demo-user', scholarshipId);
    setSavedItems(scholarshipService.getLocalSavedScholarships());
  };

  // Calculate days remaining
  const getDaysRemaining = (deadlineStr: string): number => {
    const deadline = new Date(deadlineStr);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Export to .ics calendar format
  const exportToCalendar = (item: SavedScholarship) => {
    const d = new Date(item.deadline);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}T120000Z`;

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ScholarPath//Scholarship Application Deadline//EN
BEGIN:VEVENT
UID:${item.scholarshipId}-${Date.now()}@scholarpath.edu
DTSTAMP:${dateStr}
DTSTART:${dateStr}
DTEND:${dateStr}
SUMMARY:ScholarPath Deadline: ${item.scholarshipName}
DESCRIPTION:Application closing date for ${item.scholarshipName} (${item.country}). Ensure all IBCC/HEC documents and motivation letters are submitted.
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-P7D
ACTION:DISPLAY
DESCRIPTION:Scholarship deadline approaching in 7 days!
END:VALARM
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scholarship-deadline-${item.scholarshipId}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSetReminder = (item: SavedScholarship) => {
    setReminderNotice(`Application deadline reminder for "${item.scholarshipName}" scheduled for ${reminderEmail}.`);
    setTimeout(() => setReminderNotice(null), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      
      {/* Header Banner */}
      <div className="bg-[#0A192F] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-800 text-xs font-semibold text-sky-300">
              <Calendar className="w-3.5 h-3.5" />
              <span>Module 8 — Application Deadline &amp; Reminder Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Application Deadline Tracker
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Track closing dates for your bookmarked scholarships, monitor preparation status, and download calendar reminders (.ics) for Google Calendar or Apple Calendar.
            </p>
          </div>

          {onNavigateToFinder && (
            <button
              onClick={onNavigateToFinder}
              className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 transition shrink-0"
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>Find More Scholarships</span>
            </button>
          )}
        </div>

        {/* Reminder Notification Toast */}
        {reminderNotice && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-xs font-semibold text-emerald-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{reminderNotice}</span>
          </div>
        )}
      </div>

      {/* Saved Scholarships Table / List */}
      <div className="bg-[#0A192F] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-base">
            Tracked Application Deadlines ({savedItems.length})
          </h3>
          <span className="text-xs text-slate-400">
            Keep application statuses updated from Saved to Submitted
          </span>
        </div>

        {savedItems.length === 0 ? (
          <div className="p-12 text-center text-slate-400 border border-dashed border-slate-800 rounded-2xl space-y-3">
            <Clock className="w-10 h-10 text-slate-500 mx-auto" />
            <h4 className="font-bold text-white text-sm">No Saved Scholarships Yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Browse the scholarship directory and click the bookmark button on opportunities you wish to apply for.
            </p>
            {onNavigateToFinder && (
              <button
                onClick={onNavigateToFinder}
                className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-semibold"
              >
                Browse Scholarships
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {savedItems.map((item) => {
              const daysLeft = getDaysRemaining(item.deadline);
              const isUrgent = daysLeft >= 0 && daysLeft <= 14;
              const isExpired = daysLeft < 0;
              const originalSchol = scholarships.find((s) => s.id === item.scholarshipId);

              return (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          {item.country}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 capitalize">
                          {item.fundingCoverage.replace('_', ' ')}
                        </span>
                        {isExpired ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-950 text-rose-300 border border-rose-800">
                            Cycle Closed
                          </span>
                        ) : isUrgent ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-950 text-rose-300 border border-rose-800 animate-pulse flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Closing Soon ({daysLeft} days)</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-950 text-sky-300 border border-sky-800">
                            {daysLeft} days remaining
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-white text-base">
                        {item.scholarshipName}
                      </h4>
                      <p className="text-xs text-slate-400">
                        Deadline: <strong className="text-slate-200">{new Date(item.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>
                      </p>
                    </div>

                    {/* Status Dropdown & Action Controls */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div>
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.scholarshipId, e.target.value as ApplicationStatus)}
                          className={`text-xs font-bold px-3 py-2 rounded-xl border focus:outline-none ${
                            item.status === 'awarded'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : item.status === 'submitted'
                              ? 'bg-blue-950 text-blue-300 border-blue-800'
                              : item.status === 'preparing'
                              ? 'bg-amber-950 text-amber-300 border-amber-800'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          <option value="saved">Status: Saved</option>
                          <option value="preparing">Status: Preparing Documents</option>
                          <option value="submitted">Status: Submitted</option>
                          <option value="awarded">Status: Awarded!</option>
                          <option value="rejected">Status: Not Selected</option>
                        </select>
                      </div>

                      <button
                        onClick={() => exportToCalendar(item)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                        title="Add to Google/Apple Calendar (.ics)"
                      >
                        <Calendar className="w-4 h-4 text-sky-400" />
                      </button>

                      <button
                        onClick={() => handleSetReminder(item)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                        title="Set deadline email reminder"
                      >
                        <Bell className="w-4 h-4 text-amber-400" />
                      </button>

                      {originalSchol && onOpenAssistantForScholarship && (
                        <button
                          onClick={() => onOpenAssistantForScholarship(originalSchol)}
                          className="px-3 py-2 rounded-xl bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-800 text-xs font-semibold flex items-center gap-1.5 transition"
                          title="Generate Motivation letter for this scholarship"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Draft SOP</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleRemove(item.scholarshipId)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition"
                        title="Remove from tracker"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {item.notes && (
                    <p className="text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 italic">
                      Note: {item.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
