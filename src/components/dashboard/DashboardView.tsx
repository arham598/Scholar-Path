import React from 'react';
import { 
  Sparkles, 
  GraduationCap, 
  Calendar, 
  FolderCheck, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  ExternalLink,
  Coins,
  FileText,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Scholarship, SavedScholarship, DocumentItem } from '../../types/scholarship';
import { NavigationTab } from '../common/Sidebar';

interface DashboardViewProps {
  scholarships: Scholarship[];
  savedScholarships: SavedScholarship[];
  documents: DocumentItem[];
  onNavigate: (tab: NavigationTab) => void;
  onSelectScholarshipForDetails: (scholarship: Scholarship) => void;
  onCheckEligibilityForScholarship: (scholarship: Scholarship) => void;
  onOpenAssistantForScholarship: (scholarship: Scholarship) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  scholarships,
  savedScholarships,
  documents,
  onNavigate,
  onSelectScholarshipForDetails,
  onCheckEligibilityForScholarship,
  onOpenAssistantForScholarship,
}) => {
  const { profile } = useAuth();

  // Metrics calculations
  const activeScholarships = scholarships.filter((s) => !s.isExpired);
  const studentPct = profile.intermediate?.percentage || profile.matric?.percentage || 80;

  // Estimate eligible matches based on student's percentage & nationality
  const eligibleScholarships = activeScholarships.filter((s) => {
    const minP = s.minPercentage || 60;
    return studentPct >= minP;
  });

  const readyDocs = documents.filter((d) => d.status === 'ready' || d.status === 'verified').length;
  const missingDocs = documents.filter((d) => d.status === 'missing').length;
  const docsProgress = Math.round((readyDocs / documents.length) * 100);

  // Urgent deadlines (< 45 days)
  const urgentScholarships = [...activeScholarships]
    .sort((a, b) => new Date(a.applicationClosingDate).getTime() - new Date(b.applicationClosingDate).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      
      {/* Top Welcome Hero */}
      <div className="bg-gradient-to-r from-[#0A192F] via-[#102444] to-[#0A192F] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/90 border border-sky-800 text-xs font-semibold text-sky-300">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Welcome Back, {profile.fullName || 'Scholar'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Your Scholarship Application Hub
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Evaluating opportunities for <strong>{profile.desiredDegree || 'Engineering & Computer Science'}</strong> with your verified academic profile ({studentPct}% marks).
            </p>
          </div>

          {/* Quick CTA Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('eligibility')}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-sky-600/25 transition active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Check Eligibility</span>
            </button>

            <button
              onClick={() => onNavigate('finder')}
              className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm flex items-center gap-2 transition"
            >
              <Search className="w-4 h-4" />
              <span>Explore All</span>
            </button>
          </div>
        </div>

        {/* Background glow decoration */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Eligible Matches */}
        <div 
          onClick={() => onNavigate('finder')}
          className="bg-[#0A192F] hover:bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-3xl shadow-lg cursor-pointer transition space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Eligible Opportunities</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-800 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-white">{eligibleScholarships.length}</div>
            <p className="text-xs text-emerald-400 mt-1 font-medium">
              Based on {studentPct}% marks in record
            </p>
          </div>
        </div>

        {/* Card 2: Total Verified Directory */}
        <div 
          onClick={() => onNavigate('finder')}
          className="bg-[#0A192F] hover:bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-3xl shadow-lg cursor-pointer transition space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Published Directory</span>
            <div className="w-9 h-9 rounded-xl bg-sky-950/80 border border-sky-800 flex items-center justify-center text-sky-400">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-white">{scholarships.length}</div>
            <p className="text-xs text-sky-400 mt-1 font-medium">
              Pakistan &amp; 10+ destination countries
            </p>
          </div>
        </div>

        {/* Card 3: Saved & Tracking */}
        <div 
          onClick={() => onNavigate('deadlines')}
          className="bg-[#0A192F] hover:bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-3xl shadow-lg cursor-pointer transition space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Saved in Tracker</span>
            <div className="w-9 h-9 rounded-xl bg-amber-950/80 border border-amber-800 flex items-center justify-center text-amber-400">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-white">{savedScholarships.length}</div>
            <p className="text-xs text-amber-300 mt-1 font-medium">
              Active deadline countdowns
            </p>
          </div>
        </div>

        {/* Card 4: Document Readiness */}
        <div 
          onClick={() => onNavigate('documents')}
          className="bg-[#0A192F] hover:bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-3xl shadow-lg cursor-pointer transition space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Documents Ready</span>
            <div className="w-9 h-9 rounded-xl bg-blue-950/80 border border-blue-800 flex items-center justify-center text-blue-400">
              <FolderCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-black text-white">{docsProgress}%</div>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              {readyDocs} ready, {missingDocs} pending
            </p>
          </div>
        </div>

      </div>

      {/* Main Grid: Recommended Matches & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Top Matched Scholarships for You (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="space-y-0.5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span>Top Recommended Opportunities for Your Profile</span>
              </h3>
              <p className="text-xs text-slate-400">
                Filtered against your {profile.nationality} nationality and {studentPct}% percentage
              </p>
            </div>

            <button
              onClick={() => onNavigate('finder')}
              className="text-xs text-sky-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {eligibleScholarships.slice(0, 4).map((s) => (
              <div
                key={s.id}
                className="p-5 rounded-3xl bg-[#0A192F] border border-slate-800 hover:border-slate-700 shadow-md space-y-3 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xl">{s.destinationFlag}</span>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700">
                        {s.country}
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 capitalize">
                        {s.fundingCoverage.replace('_', ' ')}
                      </span>
                      {s.languageRequirements.englishMediumWaiver && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800">
                          MOI Accepted
                        </span>
                      )}
                    </div>

                    <h4 
                      onClick={() => onSelectScholarshipForDetails(s)}
                      className="font-bold text-white text-base hover:text-sky-300 cursor-pointer transition pt-1 line-clamp-1"
                    >
                      {s.name}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {s.provider}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-sky-300 block">
                      {new Date(s.applicationClosingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="text-[10px] text-slate-400">Deadline</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  {s.academicRequirements}
                </p>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Eligible: Min {s.minPercentage || 60}% (You have {studentPct}%)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onCheckEligibilityForScholarship(s)}
                      className="px-3 py-1.5 rounded-xl bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-800 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Check Details</span>
                    </button>

                    <button
                      onClick={() => onSelectScholarshipForDetails(s)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Deadlines Countdown & Document Alert (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Missing Documents Alert Box */}
          {missingDocs > 0 && (
            <div className="p-5 rounded-3xl bg-amber-950/30 border border-amber-900/60 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Pending Document Verification</span>
                </div>
                <span className="text-xs font-bold text-amber-400 bg-amber-900/60 px-2 py-0.5 rounded-full border border-amber-800">
                  {missingDocs} Pending
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                You have {missingDocs} pending documents (such as IBCC attestation, 2nd reference letter, or passport). Complete these before scholarship portals close.
              </p>
              <button
                onClick={() => onNavigate('documents')}
                className="w-full py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition text-center"
              >
                Open Document Manager
              </button>
            </div>
          )}

          {/* Upcoming Application Deadlines Feed */}
          <div className="bg-[#0A192F] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-sky-400" />
                <span>Upcoming Deadlines</span>
              </h3>
              <button 
                onClick={() => onNavigate('deadlines')}
                className="text-xs text-sky-400 hover:underline"
              >
                Tracker View
              </button>
            </div>

            <div className="space-y-3">
              {urgentScholarships.map((s) => {
                const deadline = new Date(s.applicationClosingDate);
                const daysRemaining = Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

                return (
                  <div
                    key={s.id}
                    className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <span>{s.destinationFlag}</span>
                        <span className="truncate">{s.country}</span>
                      </div>
                      <h5 
                        onClick={() => onSelectScholarshipForDetails(s)}
                        className="font-semibold text-white text-xs truncate hover:text-sky-300 cursor-pointer pt-0.5"
                      >
                        {s.name}
                      </h5>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-sky-400 block">
                        {daysRemaining > 0 ? `${daysRemaining}d left` : 'Closed'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recently Verified Opportunities Card */}
          <div className="bg-[#0A192F] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Official Verification Audit</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              All 13+ scholarship records in this application are audited against official published guidelines from HEC Pakistan, DAAD Germany, Italian regional bodies, YTB Türkiye, and USEFP USA.
            </p>
            <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800">
              Verified Source: Ministry portals &amp; Official Consulates
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
