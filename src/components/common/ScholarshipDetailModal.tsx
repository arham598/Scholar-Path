import React from 'react';
import { 
  X, 
  ExternalLink, 
  CheckCircle2, 
  Calendar, 
  FileText, 
  Sparkles, 
  Bookmark, 
  BookmarkCheck, 
  ShieldCheck, 
  AlertCircle,
  GraduationCap,
  Globe,
  Coins
} from 'lucide-react';
import { Scholarship } from '../../types/scholarship';

interface ScholarshipDetailModalProps {
  scholarship: Scholarship | null;
  isOpen: boolean;
  onClose: () => void;
  isSaved?: boolean;
  onToggleSave?: (scholarship: Scholarship) => void;
  onCheckEligibility?: (scholarship: Scholarship) => void;
  onOpenAssistantForScholarship?: (scholarship: Scholarship) => void;
}

export const ScholarshipDetailModal: React.FC<ScholarshipDetailModalProps> = ({
  scholarship,
  isOpen,
  onClose,
  isSaved = false,
  onToggleSave,
  onCheckEligibility,
  onOpenAssistantForScholarship,
}) => {
  if (!isOpen || !scholarship) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div 
        className="w-full max-w-3xl bg-[#0A192F] border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-slate-100 my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-[#0A192F] to-slate-900 border-b border-slate-800 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-2xl">{scholarship.destinationFlag}</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-950 text-sky-300 border border-sky-800/80">
                {scholarship.country}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/80 capitalize">
                {scholarship.fundingCoverage.replace('_', ' ')}
              </span>
              {scholarship.isVerified && (
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-950 text-blue-300 border border-blue-800/80">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Published Criteria</span>
                </span>
              )}
              {scholarship.isExpired && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-950 text-rose-300 border border-rose-800/80">
                  Expired / Past Cycle
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight pt-1">
              {scholarship.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Provider: <span className="text-slate-200 font-medium">{scholarship.provider}</span>
            </p>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-sm text-slate-200">
          
          {/* Key Dates & Highlights Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <div>
              <div className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                <Calendar className="w-3.5 h-3.5 text-sky-400" />
                <span>Application Deadline</span>
              </div>
              <p className="font-semibold text-white">
                {new Date(scholarship.applicationClosingDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>

            <div>
              <div className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                <GraduationCap className="w-3.5 h-3.5 text-sky-400" />
                <span>Degree Levels</span>
              </div>
              <p className="font-semibold text-white">
                {scholarship.degreeLevels.join(', ')}
              </p>
            </div>

            <div>
              <div className="text-xs text-slate-400 flex items-center gap-1 mb-1">
                <Coins className="w-3.5 h-3.5 text-emerald-400" />
                <span>Min Academic %</span>
              </div>
              <p className="font-semibold text-emerald-300">
                {scholarship.minPercentage ? `${scholarship.minPercentage}% minimum` : 'Competitive merit'}
              </p>
            </div>
          </div>

          {/* Funding Coverage Details */}
          <div className="space-y-2">
            <h4 className="text-xs uppercase font-bold tracking-wider text-sky-400 flex items-center gap-1.5">
              <Coins className="w-4 h-4" />
              <span>Full Funding Benefits &amp; Coverage</span>
            </h4>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-300 leading-relaxed">
              {scholarship.fundingDetails}
            </div>
          </div>

          {/* Academic & Age Requirements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-xs uppercase font-bold tracking-wider text-sky-400 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4" />
                <span>Academic Requirements</span>
              </h4>
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-300 text-xs sm:text-sm leading-relaxed">
                {scholarship.academicRequirements}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs uppercase font-bold tracking-wider text-sky-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                <span>Age Restrictions</span>
              </h4>
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-300 text-xs sm:text-sm leading-relaxed">
                {scholarship.ageRestrictions || 'No age limit specified for regular degree candidates.'}
              </div>
            </div>
          </div>

          {/* Language Requirements */}
          <div className="space-y-2">
            <h4 className="text-xs uppercase font-bold tracking-wider text-sky-400 flex items-center gap-1.5">
              <Globe className="w-4 h-4" />
              <span>Language Proficiency Criteria</span>
            </h4>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs sm:text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-white">Accepted Exams:</span>
                {scholarship.languageRequirements.accepted.map((t, idx) => (
                  <span key={idx} className="bg-slate-800 px-2 py-0.5 rounded text-sky-300 border border-slate-700">
                    {t}
                  </span>
                ))}
              </div>
              <p className="text-slate-300 leading-relaxed">
                {scholarship.languageRequirements.description}
              </p>
              {scholarship.languageRequirements.englishMediumWaiver && (
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold pt-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>English Medium of Instruction certificate from Pakistani university accepted / Free language course provided.</span>
                </div>
              )}
            </div>
          </div>

          {/* Required Documents */}
          <div className="space-y-2">
            <h4 className="text-xs uppercase font-bold tracking-wider text-sky-400 flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              <span>Mandatory Application Documents</span>
            </h4>
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                {scholarship.requiredDocuments.map((doc, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Verification Audit Log & Source */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
            <div>
              <span>Source: </span>
              <a 
                href={scholarship.sourceUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sky-400 hover:underline inline-flex items-center gap-1"
              >
                <span>Official Provider Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div>
              Last Verified: <span className="text-slate-200 font-medium">{scholarship.lastVerifiedDate}</span> by {scholarship.verifiedBy}
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-6 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onToggleSave && (
              <button
                onClick={() => onToggleSave(scholarship)}
                className={`px-4 py-2.5 rounded-xl border font-medium text-xs sm:text-sm flex items-center gap-2 transition ${
                  isSaved 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                    : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {isSaved ? <BookmarkCheck className="w-4 h-4 text-amber-400" /> : <Bookmark className="w-4 h-4" />}
                <span>{isSaved ? 'Saved to Tracker' : 'Bookmark Scholarship'}</span>
              </button>
            )}

            {onCheckEligibility && (
              <button
                onClick={() => {
                  onClose();
                  onCheckEligibility(scholarship);
                }}
                className="px-4 py-2.5 rounded-xl bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-800 font-medium text-xs sm:text-sm flex items-center gap-2 transition"
              >
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span>Check My Eligibility</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onOpenAssistantForScholarship && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAssistantForScholarship(scholarship);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs sm:text-sm flex items-center gap-2 transition"
              >
                <FileText className="w-4 h-4 text-sky-400" />
                <span>Generate Motivation Letter</span>
              </button>
            )}

            <a
              href={scholarship.officialApplicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-sky-600/20 transition active:scale-95"
            >
              <span>Apply on Official Portal</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
