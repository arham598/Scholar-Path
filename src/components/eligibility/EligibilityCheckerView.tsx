import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  HelpCircle, 
  ShieldCheck, 
  ArrowRight, 
  FileText, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Scholarship, EligibilityEvaluation, EligibilityStatus } from '../../types/scholarship';
import { checkEligibility } from '../../services/aiEligibilityService';

interface EligibilityCheckerViewProps {
  scholarships: Scholarship[];
  selectedScholarship?: Scholarship | null;
  onOpenAssistantForScholarship?: (scholarship: Scholarship) => void;
  onNavigateToProfile?: () => void;
}

export const EligibilityCheckerView: React.FC<EligibilityCheckerViewProps> = ({
  scholarships,
  selectedScholarship,
  onOpenAssistantForScholarship,
  onNavigateToProfile,
}) => {
  const { profile } = useAuth();
  const [activeScholarshipId, setActiveScholarshipId] = useState<string>(
    selectedScholarship ? selectedScholarship.id : (scholarships[0]?.id || '')
  );
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluations, setEvaluations] = useState<Record<string, EligibilityEvaluation>>({});
  const [expandedId, setExpandedId] = useState<string | null>(activeScholarshipId);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [batchEvaluating, setBatchEvaluating] = useState<boolean>(false);

  const activeScholarship = scholarships.find((s) => s.id === activeScholarshipId) || scholarships[0];

  const handleEvaluateSingle = async (s: Scholarship) => {
    setIsEvaluating(true);
    const result = await checkEligibility(profile, s);
    setEvaluations((prev) => ({ ...prev, [s.id]: result }));
    setExpandedId(s.id);
    setIsEvaluating(false);
  };

  const handleBatchEvaluateAll = async () => {
    setBatchEvaluating(true);
    const activeOnes = scholarships.filter((s) => !s.isExpired);
    const results: Record<string, EligibilityEvaluation> = { ...evaluations };

    for (const s of activeOnes) {
      const res = await checkEligibility(profile, s);
      results[s.id] = res;
    }

    setEvaluations(results);
    setBatchEvaluating(false);
  };

  const currentEval = activeScholarship ? evaluations[activeScholarship.id] : null;

  // Status badge styling helper
  const renderStatusBadge = (status: EligibilityStatus) => {
    switch (status) {
      case 'eligible':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Eligible</span>
          </span>
        );
      case 'potentially_eligible':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-950 text-amber-300 border border-amber-800">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Potentially Eligible</span>
          </span>
        );
      case 'not_eligible':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-950 text-rose-300 border border-rose-800">
            <XCircle className="w-3.5 h-3.5" />
            <span>Not Eligible</span>
          </span>
        );
      case 'missing_info':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-950 text-sky-300 border border-sky-800">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Missing Information</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      
      {/* Header Banner */}
      <div className="bg-[#0A192F] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-800 text-xs font-semibold text-sky-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Module 3 — AI Eligibility Evaluation &amp; Requirement Gap Analysis</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              AI Scholarship Eligibility Checker
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              ScholarPath cross-checks your academic record (Matric {profile.matric?.percentage}%, Intermediate {profile.intermediate?.percentage}%), nationality ({profile.nationality}), language status, and age against published criteria.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleBatchEvaluateAll}
              disabled={batchEvaluating}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-sky-600/20 transition active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 ${batchEvaluating ? 'animate-spin' : ''}`} />
              <span>{batchEvaluating ? 'Evaluating All...' : 'Evaluate All Scholarships'}</span>
            </button>

            {onNavigateToProfile && (
              <button
                onClick={onNavigateToProfile}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition"
              >
                Update Profile
              </button>
            )}
          </div>
        </div>

        {/* Disclaimer Callout */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex items-start gap-2.5 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <span>
            Ethical AI Notice: ScholarPath evaluates eligibility based on actual published requirements. We never promise or claim guaranteed admission or scholarship award. Selection is solely determined by official scholarship boards.
          </span>
        </div>
      </div>

      {/* Select Scholarship Bar */}
      <div className="bg-[#0A192F] border border-slate-800 rounded-3xl p-6 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Select Target Scholarship to Evaluate
            </label>
            <select
              value={activeScholarshipId}
              onChange={(e) => setActiveScholarshipId(e.target.value)}
              className="w-full sm:w-96 bg-slate-900 text-sm text-slate-100 px-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-sky-500 font-medium"
            >
              {scholarships.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.destinationFlag} {s.name} ({s.country})
                </option>
              ))}
            </select>
          </div>

          {activeScholarship && (
            <button
              onClick={() => handleEvaluateSingle(activeScholarship)}
              disabled={isEvaluating}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20 transition active:scale-95 self-end sm:self-auto"
            >
              <Sparkles className={`w-4 h-4 ${isEvaluating ? 'animate-spin' : ''}`} />
              <span>{isEvaluating ? 'Analyzing Criteria...' : 'Run Detailed Check'}</span>
            </button>
          )}
        </div>

        {/* Selected Scholarship Summary Strip */}
        {activeScholarship && (
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs sm:text-sm grid grid-cols-1 sm:grid-cols-4 gap-3 text-slate-300">
            <div>
              <span className="text-slate-400 block text-[11px]">Provider:</span>
              <span className="font-semibold text-white">{activeScholarship.provider}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Degree Levels:</span>
              <span className="font-semibold text-white">{activeScholarship.degreeLevels.join(', ')}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Published Min Academic %:</span>
              <span className="font-semibold text-emerald-400">
                {activeScholarship.minPercentage ? `${activeScholarship.minPercentage}% marks` : 'Competitive'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Application Deadline:</span>
              <span className="font-semibold text-sky-300">
                {new Date(activeScholarship.applicationClosingDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Active Evaluation Detail Box */}
      {currentEval ? (
        <div className="bg-[#0A192F] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          
          {/* Verdict Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-[#102444] border border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                {renderStatusBadge(currentEval.status)}
                <span className="text-xs text-slate-400">
                  Criteria Match Score: <strong className="text-white">{currentEval.overallScore}%</strong>
                </span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                Eligibility Verdict for {currentEval.scholarshipName}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                {currentEval.summary}
              </p>
            </div>

            {onOpenAssistantForScholarship && activeScholarship && (
              <button
                onClick={() => onOpenAssistantForScholarship(activeScholarship)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition shrink-0"
              >
                <FileText className="w-4 h-4 text-sky-400" />
                <span>Prepare Application Letter</span>
              </button>
            )}
          </div>

          {/* Criteria Breakdown Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Matched Criteria */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Matched Requirements ({currentEval.matchedCriteria.length})</span>
              </h4>
              <div className="space-y-2.5">
                {currentEval.matchedCriteria.map((c, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-900/50 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                      <span>{c.title}</span>
                      <span className="uppercase text-[10px] bg-emerald-900/80 px-2 py-0.5 rounded">Satisfied</span>
                    </div>
                    <p className="text-xs text-slate-200">{c.message}</p>
                    {c.details && <p className="text-[11px] text-slate-400">{c.details}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Unmet or Missing Criteria */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase font-bold tracking-wider text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                <span>Pending or Missing Criteria ({currentEval.missingCriteria.length + currentEval.unmetCriteria.length})</span>
              </h4>
              <div className="space-y-2.5">
                {currentEval.missingCriteria.map((c, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-sky-950/30 border border-sky-900/50 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-sky-300">
                      <span>{c.title}</span>
                      <span className="uppercase text-[10px] bg-sky-900/80 px-2 py-0.5 rounded">Pending Action</span>
                    </div>
                    <p className="text-xs text-slate-200">{c.message}</p>
                    {c.details && <p className="text-[11px] text-slate-400">{c.details}</p>}
                  </div>
                ))}

                {currentEval.unmetCriteria.map((c, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-rose-950/30 border border-rose-900/50 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-rose-300">
                      <span>{c.title}</span>
                      <span className="uppercase text-[10px] bg-rose-900/80 px-2 py-0.5 rounded">Below Requirement</span>
                    </div>
                    <p className="text-xs text-slate-200">{c.message}</p>
                    {c.details && <p className="text-[11px] text-slate-400">{c.details}</p>}
                  </div>
                ))}

                {currentEval.missingCriteria.length === 0 && currentEval.unmetCriteria.length === 0 && (
                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 text-center py-6">
                    No unmet requirements detected! Your profile completely satisfies all published criteria.
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Actionable Recommendations */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <h4 className="text-xs uppercase font-bold tracking-wider text-sky-400">
              Recommended Next Steps
            </h4>
            <ul className="space-y-2">
              {currentEval.recommendedNextSteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <ArrowRight className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      ) : (
        <div className="bg-[#0A192F] border border-slate-800 rounded-3xl p-10 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-sky-950/80 border border-sky-800 text-sky-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">Ready for Eligibility Evaluation</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Click <strong>&quot;Run Detailed Check&quot;</strong> above to compare your profile against {activeScholarship?.name}.
          </p>
          <button
            onClick={() => activeScholarship && handleEvaluateSingle(activeScholarship)}
            className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-lg shadow-sky-600/20"
          >
            Evaluate {activeScholarship?.name}
          </button>
        </div>
      )}

      {/* Evaluated History List (If batch evaluated) */}
      {Object.keys(evaluations).length > 1 && (
        <div className="bg-[#0A192F] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Evaluated Scholarships Summary ({Object.keys(evaluations).length})</span>
          </h3>

          <div className="space-y-2.5">
            {Object.entries(evaluations).map(([id, ev]) => {
              const schol = scholarships.find((s) => s.id === id);
              if (!schol) return null;
              return (
                <div
                  key={id}
                  onClick={() => {
                    setActiveScholarshipId(id);
                    setExpandedId(id);
                  }}
                  className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 cursor-pointer flex items-center justify-between gap-4 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl">{schol.destinationFlag}</span>
                    <div className="truncate">
                      <h4 className="font-semibold text-white text-sm truncate">{schol.name}</h4>
                      <p className="text-xs text-slate-400 truncate">{schol.country} • {schol.provider}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {renderStatusBadge(ev.status)}
                    <span className="text-xs font-bold text-white">{ev.overallScore}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
