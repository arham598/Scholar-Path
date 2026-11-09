import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Plus, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  Database, 
  ExternalLink,
  Trash2,
  X,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Scholarship, DegreeLevel, FundingType } from '../../types/scholarship';
import { scholarshipService } from '../../services/scholarshipService';

interface AdminDashboardViewProps {
  scholarships: Scholarship[];
  onRefreshScholarships: () => Promise<void>;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  scholarships,
  onRefreshScholarships,
}) => {
  const { user, isAdmin } = useAuth();
  const [editingScholarship, setEditingScholarship] = useState<Scholarship | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<string | null>(null);

  // New scholarship template
  const emptyScholarship: Scholarship = {
    id: 'schol-' + Date.now(),
    name: '',
    provider: '',
    country: 'Pakistan',
    destinationFlag: '🇵🇰',
    degreeLevels: ['Master'],
    eligibleNationalities: ['Pakistan'],
    minPercentage: 65,
    academicRequirements: '',
    ageRestrictions: 'No age limit.',
    languageRequirements: {
      accepted: ['English Medium Certificate', 'IELTS'],
      englishMediumWaiver: true,
      description: 'Accepted from verified Pakistani university.',
    },
    fundingCoverage: 'fully_funded',
    fundingDetails: 'Full tuition fee waiver, monthly living allowance, and health insurance.',
    applicationOpeningDate: new Date().toISOString().split('T')[0],
    applicationClosingDate: '2027-01-31',
    requiredDocuments: [
      'Matric & Intermediate marksheets (IBCC attested)',
      'University transcripts & degree (HEC attested)',
      'Valid passport copy',
      'Letter of Motivation',
      'Two letters of recommendation'
    ],
    officialApplicationUrl: 'https://',
    sourceUrl: 'https://',
    isVerified: true,
    isExpired: false,
    lastVerifiedDate: new Date().toISOString().split('T')[0],
    verifiedBy: user?.email || 'Official Administrator (Kashif Arham)',
  };

  const [formData, setFormData] = useState<Scholarship>(emptyScholarship);

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    try {
      const res = await scholarshipService.seedScholarshipsToFirestore();
      setSeedResult(`Successfully synchronized ${res.count} verified scholarships to Firestore!`);
      await onRefreshScholarships();
    } catch (err: any) {
      setSeedResult(`Seeding notice: ${err.message || 'Updated local cache'}`);
    } finally {
      setIsSeeding(false);
      setTimeout(() => setSeedResult(null), 5000);
    }
  };

  const handleToggleExpired = async (s: Scholarship) => {
    await scholarshipService.toggleScholarshipExpired(s.id, !s.isExpired);
    await onRefreshScholarships();
  };

  const handleSaveScholarship = async (e: React.FormEvent) => {
    e.preventDefault();
    await scholarshipService.upsertScholarship(formData);
    await onRefreshScholarships();
    setIsNewModalOpen(false);
    setEditingScholarship(null);
  };

  const openEditModal = (s: Scholarship) => {
    setFormData(s);
    setEditingScholarship(s);
    setIsNewModalOpen(true);
  };

  const openNewModal = () => {
    setFormData({ ...emptyScholarship, id: 'schol-' + Date.now() });
    setEditingScholarship(null);
    setIsNewModalOpen(true);
  };

  if (!isAdmin) {
    return (
      <div className="bg-[#0A192F] border border-slate-800 rounded-3xl p-12 text-center space-y-4 max-w-xl mx-auto my-12">
        <div className="w-16 h-16 rounded-2xl bg-amber-950/80 border border-amber-800 flex items-center justify-center text-amber-400 mx-auto">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Administrator Access Required</h2>
        <p className="text-sm text-slate-300">
          This portal is reserved for authorized administrators to manage official criteria, verify dates, and update published scholarships. Ordinary students cannot edit official criteria.
        </p>
        <p className="text-xs text-sky-400">
          Tip: You can test administrator view using the Demo Admin toggle in the top header menu.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      
      {/* Header Banner */}
      <div className="bg-[#0A192F] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-800 text-xs font-semibold text-amber-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Module 9 — Verified Scholarship Editorial &amp; Governance Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Official Admin Dashboard
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Authorized admin: <strong>{user?.email || 'kashifarham096@gmail.com'}</strong>. Add, edit, verify, or archive published scholarships. All changes enforce published academic percentages and official URLs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleSeedDatabase}
              disabled={isSeeding}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition"
            >
              <Database className="w-4 h-4 text-sky-400" />
              <span>{isSeeding ? 'Syncing...' : 'Sync Firestore Database'}</span>
            </button>

            <button
              onClick={openNewModal}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-sky-600/20 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Verified Scholarship</span>
            </button>
          </div>
        </div>

        {/* Sync Toast Feedback */}
        {seedResult && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-xs font-semibold text-emerald-300 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{seedResult}</span>
          </div>
        )}
      </div>

      {/* Scholarships Inventory Table */}
      <div className="bg-[#0A192F] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-base">
            Verified Scholarship Records ({scholarships.length})
          </h3>
          <span className="text-xs text-slate-400">
            Source URLs and Last Verified timestamps are recorded for audit compliance
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Scholarship &amp; Provider</th>
                <th className="py-3 px-3">Country</th>
                <th className="py-3 px-3">Degree Levels</th>
                <th className="py-3 px-3">Academic %</th>
                <th className="py-3 px-3">Deadline</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Last Verified</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {scholarships.map((s) => (
                <tr key={s.id} className="hover:bg-slate-900/50 transition">
                  <td className="py-3.5 px-4 font-semibold text-white max-w-xs truncate">
                    <div className="flex items-center gap-2">
                      <span>{s.destinationFlag}</span>
                      <span className="truncate">{s.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-normal truncate mt-0.5">
                      {s.provider}
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 font-medium">
                      {s.country}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-slate-300">
                    {s.degreeLevels.join(', ')}
                  </td>

                  <td className="py-3.5 px-3 font-semibold text-emerald-400">
                    {s.minPercentage ? `${s.minPercentage}%` : 'Merit'}
                  </td>

                  <td className="py-3.5 px-3 text-slate-300">
                    {s.applicationClosingDate}
                  </td>

                  <td className="py-3.5 px-3">
                    {s.isExpired ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                        Expired
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                        Active Cycle
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-3 text-[11px] text-slate-400">
                    <div>{s.lastVerifiedDate}</div>
                    <div className="text-[10px] text-sky-400 truncate max-w-[120px]">{s.verifiedBy}</div>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(s)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 transition"
                        title="Edit criteria"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleToggleExpired(s)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition ${
                          s.isExpired
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : 'bg-rose-950 text-rose-300 border-rose-800'
                        }`}
                        title={s.isExpired ? 'Mark active' : 'Mark expired cycle'}
                      >
                        {s.isExpired ? 'Reactivate' : 'Expire'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Scholarship Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div 
            className="w-full max-w-2xl bg-[#0A192F] border border-slate-700 rounded-3xl shadow-2xl p-6 space-y-4 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-lg">
                {editingScholarship ? 'Edit Scholarship Criteria' : 'Add New Verified Scholarship'}
              </h3>
              <button 
                onClick={() => setIsNewModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveScholarship} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Scholarship Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-900 text-slate-100 p-2.5 rounded-xl border border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Awarding Provider *</label>
                  <input
                    type="text"
                    required
                    value={formData.provider}
                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                    className="w-full bg-slate-900 text-slate-100 p-2.5 rounded-xl border border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Destination Country *</label>
                  <input
                    type="text"
                    required
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full bg-slate-900 text-slate-100 p-2.5 rounded-xl border border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Destination Flag (Emoji) *</label>
                  <input
                    type="text"
                    required
                    value={formData.destinationFlag}
                    onChange={(e) => setFormData({ ...formData, destinationFlag: e.target.value })}
                    className="w-full bg-slate-900 text-slate-100 p-2.5 rounded-xl border border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Funding Coverage *</label>
                  <select
                    value={formData.fundingCoverage}
                    onChange={(e) => setFormData({ ...formData, fundingCoverage: e.target.value as FundingType })}
                    className="w-full bg-slate-900 text-slate-100 p-2.5 rounded-xl border border-slate-700"
                  >
                    <option value="fully_funded">Fully Funded</option>
                    <option value="tuition_waiver">Tuition Fee Waiver</option>
                    <option value="partial_funding">Partial Funding</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Min Academic Percentage (%)</label>
                  <input
                    type="number"
                    value={formData.minPercentage || 60}
                    onChange={(e) => setFormData({ ...formData, minPercentage: Number(e.target.value) })}
                    className="w-full bg-slate-900 text-slate-100 p-2.5 rounded-xl border border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Application Closing Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.applicationClosingDate}
                    onChange={(e) => setFormData({ ...formData, applicationClosingDate: e.target.value })}
                    className="w-full bg-slate-900 text-slate-100 p-2.5 rounded-xl border border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Official Application URL *</label>
                  <input
                    type="url"
                    required
                    value={formData.officialApplicationUrl}
                    onChange={(e) => setFormData({ ...formData, officialApplicationUrl: e.target.value })}
                    className="w-full bg-slate-900 text-slate-100 p-2.5 rounded-xl border border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Academic Criteria Description *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.academicRequirements}
                  onChange={(e) => setFormData({ ...formData, academicRequirements: e.target.value })}
                  className="w-full bg-slate-900 text-slate-100 p-2.5 rounded-xl border border-slate-700"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Funding Benefits Details *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.fundingDetails}
                  onChange={(e) => setFormData({ ...formData, fundingDetails: e.target.value })}
                  className="w-full bg-slate-900 text-slate-100 p-2.5 rounded-xl border border-slate-700"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="englishMediumWaiver"
                  checked={formData.languageRequirements.englishMediumWaiver}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      languageRequirements: {
                        ...formData.languageRequirements,
                        englishMediumWaiver: e.target.checked,
                      },
                    })
                  }
                  className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4 bg-slate-900 border-slate-700"
                />
                <label htmlFor="englishMediumWaiver" className="text-slate-300">
                  Accepts English as Medium of Instruction (MOI) Certificate in lieu of IELTS.
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
