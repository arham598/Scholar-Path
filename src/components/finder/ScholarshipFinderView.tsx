import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  GraduationCap, 
  Calendar, 
  ExternalLink, 
  Sparkles, 
  Bookmark, 
  BookmarkCheck, 
  ShieldCheck, 
  Globe2, 
  RotateCcw,
  AlertCircle,
  Coins,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { Scholarship, DegreeLevel, FundingType } from '../../types/scholarship';
import { ScholarshipDetailModal } from '../common/ScholarshipDetailModal';

interface ScholarshipFinderViewProps {
  scholarships: Scholarship[];
  savedScholarshipIds: string[];
  onToggleSaveScholarship: (scholarship: Scholarship) => void;
  onCheckEligibility: (scholarship: Scholarship) => void;
  onOpenAssistantForScholarship: (scholarship: Scholarship) => void;
  initialSearchQuery?: string;
}

export const ScholarshipFinderView: React.FC<ScholarshipFinderViewProps> = ({
  scholarships,
  savedScholarshipIds,
  onToggleSaveScholarship,
  onCheckEligibility,
  onOpenAssistantForScholarship,
  initialSearchQuery = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [selectedDegree, setSelectedDegree] = useState<string>('All');
  const [selectedFunding, setSelectedFunding] = useState<string>('All');
  const [englishWaiverOnly, setEnglishWaiverOnly] = useState<boolean>(false);
  const [minPercentageThreshold, setMinPercentageThreshold] = useState<number>(0);
  const [viewTab, setViewTab] = useState<'active' | 'expired'>('active');
  const [activeModalScholarship, setActiveModalScholarship] = useState<Scholarship | null>(null);

  // Available countries
  const countries = useMemo(() => {
    const set = new Set<string>();
    scholarships.forEach((s) => set.add(s.country));
    return ['All', ...Array.from(set).sort()];
  }, [scholarships]);

  // Degrees
  const degreeLevels: (string | 'All')[] = ['All', 'Bachelor', 'Master', 'PhD', 'Exchange'];

  // Filtered scholarships
  const filteredScholarships = useMemo(() => {
    return scholarships.filter((s) => {
      // Expired tab vs Active tab
      if (viewTab === 'active' && s.isExpired) return false;
      if (viewTab === 'expired' && !s.isExpired) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesProvider = s.provider.toLowerCase().includes(q);
        const matchesCountry = s.country.toLowerCase().includes(q);
        const matchesReq = s.academicRequirements.toLowerCase().includes(q);
        const matchesFields = (s.targetFields || []).some(f => f.toLowerCase().includes(q));
        if (!matchesName && !matchesProvider && !matchesCountry && !matchesReq && !matchesFields) {
          return false;
        }
      }

      // Country filter
      if (selectedCountry !== 'All' && s.country !== selectedCountry) {
        return false;
      }

      // Degree filter
      if (selectedDegree !== 'All' && !s.degreeLevels.includes(selectedDegree as DegreeLevel)) {
        return false;
      }

      // Funding filter
      if (selectedFunding !== 'All' && s.fundingCoverage !== selectedFunding) {
        return false;
      }

      // English waiver filter
      if (englishWaiverOnly && !s.languageRequirements.englishMediumWaiver) {
        return false;
      }

      // Min percentage filter
      if (minPercentageThreshold > 0 && s.minPercentage && s.minPercentage > minPercentageThreshold) {
        return false;
      }

      return true;
    });
  }, [
    scholarships,
    viewTab,
    searchQuery,
    selectedCountry,
    selectedDegree,
    selectedFunding,
    englishWaiverOnly,
    minPercentageThreshold,
  ]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCountry('All');
    setSelectedDegree('All');
    setSelectedFunding('All');
    setEnglishWaiverOnly(false);
    setMinPercentageThreshold(0);
  };

  const hasActiveFilters = 
    searchQuery !== '' || 
    selectedCountry !== 'All' || 
    selectedDegree !== 'All' || 
    selectedFunding !== 'All' || 
    englishWaiverOnly || 
    minPercentageThreshold > 0;

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      
      {/* Title & Stats Header */}
      <div className="bg-[#0A192F] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-800 text-xs font-semibold text-sky-300">
              <Globe2 className="w-3.5 h-3.5" />
              <span>Modules 2 &amp; 7 — Verified Scholarship Directory &amp; Advanced Search</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Global Scholarship Finder
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Explore officially verified scholarships in Pakistan and key international destinations. Filter by published percentage criteria, language certificate acceptance, and degree levels.
            </p>
          </div>

          {/* Tab Switcher: Active vs Expired */}
          <div className="flex items-center bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shrink-0">
            <button
              onClick={() => setViewTab('active')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                viewTab === 'active'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Active Opportunities ({scholarships.filter(s => !s.isExpired).length})
            </button>
            <button
              onClick={() => setViewTab('expired')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                viewTab === 'expired'
                  ? 'bg-rose-950 text-rose-300 border border-rose-800 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Past / Expired Cycles ({scholarships.filter(s => s.isExpired).length})
            </button>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="mt-6 flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, provider, country, or study field (e.g., DAAD, Italy DSU, HEC, Computer Science)..."
              className="w-full bg-slate-900/90 text-sm text-slate-100 placeholder-slate-400 pl-11 pr-4 py-3 rounded-2xl border border-slate-700/80 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/40"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-2 border border-slate-700 transition"
              title="Reset all search filters"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>

        {/* Filter Controls Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Country Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Destination Country
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full bg-slate-900 text-xs text-slate-200 px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-sky-500"
            >
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Degree Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Degree Level
            </label>
            <select
              value={selectedDegree}
              onChange={(e) => setSelectedDegree(e.target.value)}
              className="w-full bg-slate-900 text-xs text-slate-200 px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-sky-500"
            >
              {degreeLevels.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Funding Type Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Funding Coverage
            </label>
            <select
              value={selectedFunding}
              onChange={(e) => setSelectedFunding(e.target.value)}
              className="w-full bg-slate-900 text-xs text-slate-200 px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-sky-500"
            >
              <option value="All">All Funding Models</option>
              <option value="fully_funded">Fully Funded (Tuition + Stipend)</option>
              <option value="tuition_waiver">Tuition Fee Waiver</option>
              <option value="partial_funding">Partial Funding</option>
            </select>
          </div>

          {/* Academic Percentage Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              My Academic %
            </label>
            <select
              value={minPercentageThreshold}
              onChange={(e) => setMinPercentageThreshold(Number(e.target.value))}
              className="w-full bg-slate-900 text-xs text-slate-200 px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-sky-500"
            >
              <option value={0}>Show all thresholds</option>
              <option value={60}>Fit for 60% marks</option>
              <option value={70}>Fit for 70% marks</option>
              <option value={80}>Fit for 80% marks</option>
            </select>
          </div>

          {/* English Waiver Toggle */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => setEnglishWaiverOnly(!englishWaiverOnly)}
              className={`w-full py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-between transition ${
                englishWaiverOnly
                  ? 'bg-sky-950 border-sky-500 text-sky-300'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>No IELTS / MOI OK</span>
              {englishWaiverOnly && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />}
            </button>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1 text-sm text-slate-400">
        <div>
          Showing <span className="font-bold text-white">{filteredScholarships.length}</span> opportunities
          {hasActiveFilters && <span> (filtered)</span>}
        </div>
        <div className="text-xs text-sky-400 flex items-center gap-1">
          <ShieldCheck className="w-4 h-4" />
          <span>Zero Fabricated Criteria Guarantee</span>
        </div>
      </div>

      {/* Scholarships Grid */}
      {filteredScholarships.length === 0 ? (
        <div className="bg-[#0A192F] border border-slate-800 rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No Scholarships Matched Your Filter</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Try adjusting your search criteria, clearing the country filter, or resetting the academic percentage threshold.
          </p>
          <button
            onClick={resetFilters}
            className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredScholarships.map((s) => {
            const isSaved = savedScholarshipIds.includes(s.id);
            return (
              <div
                key={s.id}
                className="group bg-[#0A192F] hover:bg-slate-900/90 border border-slate-800 hover:border-slate-700/90 rounded-3xl p-5 shadow-lg flex flex-col justify-between transition-all duration-200"
              >
                <div className="space-y-3">
                  
                  {/* Card Header: Flags & Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xl" title={s.country}>{s.destinationFlag}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {s.country}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 capitalize">
                        {s.fundingCoverage.replace('_', ' ')}
                      </span>
                    </div>

                    <button
                      onClick={() => onToggleSaveScholarship(s)}
                      className={`p-2 rounded-xl border transition ${
                        isSaved
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                      title={isSaved ? 'Remove from saved' : 'Save to Deadline Tracker'}
                    >
                      {isSaved ? <BookmarkCheck className="w-4 h-4 text-amber-400" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Title & Provider */}
                  <div>
                    <h3 
                      onClick={() => setActiveModalScholarship(s)}
                      className="font-bold text-white text-base group-hover:text-sky-300 transition line-clamp-2 cursor-pointer pt-1"
                    >
                      {s.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                      {s.provider}
                    </p>
                  </div>

                  {/* Key Highlights */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">Degree Levels:</span>
                      <span className="font-semibold text-slate-200">{s.degreeLevels.join(', ')}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">Min Academic %:</span>
                      <span className="font-semibold text-emerald-400">
                        {s.minPercentage ? `${s.minPercentage}% marks` : 'Merit based'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-300">
                      <span className="text-slate-400">Deadline:</span>
                      <span className="font-medium text-sky-300 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(s.applicationClosingDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>

                  {/* English Waiver pill if present */}
                  {s.languageRequirements.englishMediumWaiver && (
                    <div className="inline-flex items-center gap-1 text-[11px] text-teal-300 bg-teal-950/60 border border-teal-800/60 px-2 py-0.5 rounded-lg">
                      <CheckCircle2 className="w-3 h-3 text-teal-400" />
                      <span>English Medium / MOI Certificate Accepted</span>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-4 mt-4 border-t border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => setActiveModalScholarship(s)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold text-center transition"
                  >
                    View Details
                  </button>

                  <button
                    onClick={() => onCheckEligibility(s)}
                    className="py-2 px-3 rounded-xl bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-800 text-xs font-semibold flex items-center gap-1 transition"
                    title="Run AI Eligibility Check"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    <span className="hidden sm:inline">Check</span>
                  </button>

                  <a
                    href={s.officialApplicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                    title="Open official government/university portal"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Scholarship Full Detail Modal */}
      <ScholarshipDetailModal
        scholarship={activeModalScholarship}
        isOpen={activeModalScholarship !== null}
        onClose={() => setActiveModalScholarship(null)}
        isSaved={activeModalScholarship ? savedScholarshipIds.includes(activeModalScholarship.id) : false}
        onToggleSave={onToggleSaveScholarship}
        onCheckEligibility={onCheckEligibility}
        onOpenAssistantForScholarship={onOpenAssistantForScholarship}
      />

    </div>
  );
};
