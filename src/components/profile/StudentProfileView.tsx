import React, { useState } from 'react';
import { 
  User, 
  GraduationCap, 
  Globe, 
  FileCheck, 
  Download, 
  Trash2, 
  Save, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Calculator, 
  Lock,
  Compass
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StudentProfile } from '../../types/scholarship';

interface StudentProfileViewProps {
  onNavigateToEligibility?: () => void;
}

const COUNTRIES_OPTIONS = [
  'Pakistan',
  'Germany',
  'Italy',
  'Türkiye',
  'Hungary',
  'China',
  'Japan',
  'South Korea',
  'UK',
  'USA',
  'Canada',
  'Australia',
  'Sweden',
  'France'
];

const DESIRED_DEGREES_RECOMMENDED = [
  'BS Computer Science',
  'MS Computer Science',
  'MS Artificial Intelligence',
  'MS Data Science',
  'MS Software Engineering',
  'MS Cybersecurity',
  'MS Electrical Engineering',
  'MS Biotechnology',
  'PhD Computer Science',
  'PhD Engineering',
  'Master of Public Policy',
  'Master of Business Administration (MBA)'
];

export const StudentProfileView: React.FC<StudentProfileViewProps> = ({ onNavigateToEligibility }) => {
  const { profile, updateStudentProfile, deleteStudentProfile, exportProfileData } = useAuth();
  const [formData, setFormData] = useState<StudentProfile>(profile);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'academic' | 'languages' | 'preferences'>('personal');

  // Auto calculate percentages when marks change
  const handleMatricChange = (field: 'marks' | 'totalMarks', val: string) => {
    const updated = { ...formData.matric, [field]: val };
    const m = parseFloat(field === 'marks' ? val : formData.matric.marks);
    const t = parseFloat(field === 'totalMarks' ? val : formData.matric.totalMarks);
    if (!isNaN(m) && !isNaN(t) && t > 0) {
      updated.percentage = parseFloat(((m / t) * 100).toFixed(2));
    }
    setFormData({ ...formData, matric: updated });
  };

  const handleInterChange = (field: 'marks' | 'totalMarks', val: string) => {
    const updated = { ...formData.intermediate, [field]: val };
    const m = parseFloat(field === 'marks' ? val : formData.intermediate.marks);
    const t = parseFloat(field === 'totalMarks' ? val : formData.intermediate.totalMarks);
    if (!isNaN(m) && !isNaN(t) && t > 0) {
      updated.percentage = parseFloat(((m / t) * 100).toFixed(2));
    }
    setFormData({ ...formData, intermediate: updated });
  };

  const toggleCountryPreference = (country: string) => {
    const current = formData.preferredCountries || [];
    if (current.includes(country)) {
      setFormData({
        ...formData,
        preferredCountries: current.filter((c) => c !== country),
      });
    } else {
      setFormData({
        ...formData,
        preferredCountries: [...current, country],
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateStudentProfile(formData);
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in">
      
      {/* Top Banner & Title */}
      <div className="bg-gradient-to-r from-[#0A192F] via-[#102444] to-[#0A192F] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-800 text-xs font-semibold text-sky-300">
              <Compass className="w-3.5 h-3.5" />
              <span>Module 1 — Universal Single-Entry Student Profile</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Academic &amp; Eligibility Profile
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Enter your academic and personal information once. ScholarPath evaluates your eligibility against published scholarship requirements worldwide without asking you repeatedly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={exportProfileData}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-2 transition"
              title="Download your complete profile and checklist data as JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Data</span>
            </button>

            {onNavigateToEligibility && (
              <button
                onClick={onNavigateToEligibility}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-sky-600/20 transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Evaluate Scholarships</span>
              </button>
            )}
          </div>
        </div>

        {/* Privacy Assurance Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-xs text-slate-400">
          <Lock className="w-4 h-4 text-sky-400 shrink-0" />
          <span>
            Strict Privacy Guarantee: We never collect CNIC numbers, passwords, or bank details. Free-tier compatible.
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'personal', label: 'Personal & Residence', icon: User },
          { id: 'academic', label: 'Academic Scores (Matric & Inter)', icon: GraduationCap },
          { id: 'languages', label: 'Language & Passport', icon: Globe },
          { id: 'preferences', label: 'Degree & Countries', icon: FileCheck },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition ${
                isActive
                  ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* TAB 1: PERSONAL */}
        {activeTab === 'personal' && (
          <div className="bg-[#0A192F] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-sky-400" />
              <span>Personal Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Muhammad Daniyal"
                  className="w-full bg-slate-900 text-sm text-slate-100 px-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="student@example.pk"
                  className="w-full bg-slate-900 text-sm text-slate-100 px-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Nationality *
                </label>
                <select
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  className="w-full bg-slate-900 text-sm text-slate-100 px-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/40"
                >
                  <option value="Pakistan">Pakistan</option>
                  <option value="Pakistan (AJK)">Pakistan (AJK)</option>
                  <option value="Pakistan (Gilgit-Baltistan)">Pakistan (Gilgit-Baltistan)</option>
                  <option value="Afghanistan">Afghanistan</option>
                  <option value="India">India</option>
                  <option value="Bangladesh">Bangladesh</option>
                  <option value="Other">Other International</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Country of Residence *
                </label>
                <input
                  type="text"
                  value={formData.countryOfResidence}
                  onChange={(e) => setFormData({ ...formData, countryOfResidence: e.target.value })}
                  placeholder="Pakistan"
                  className="w-full bg-slate-900 text-sm text-slate-100 px-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/40"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Date of Birth (Used only for age limits)
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth || ''}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full bg-slate-900 text-sm text-slate-100 px-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/40"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Several scholarships (e.g., GKS, MEXT, Türkiye Bursları) enforce maximum age cutoffs.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Family Monthly Income Range (Optional for Need-based aid)
                </label>
                <select
                  value={formData.familyIncomeRange || ''}
                  onChange={(e) => setFormData({ ...formData, familyIncomeRange: e.target.value })}
                  className="w-full bg-slate-900 text-sm text-slate-100 px-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/40"
                >
                  <option value="">Prefer not to state / Merit only</option>
                  <option value="Under PKR 45,000 / month">Under PKR 45,000 / month (High Need-based Priority)</option>
                  <option value="PKR 45,000 – 80,000 / month">PKR 45,000 – 80,000 / month (PEEF &amp; Ehsaas eligible)</option>
                  <option value="PKR 80,000 – 150,000 / month">PKR 80,000 – 150,000 / month (Italian DSU eligible)</option>
                  <option value="Above PKR 150,000 / month">Above PKR 150,000 / month</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ACADEMIC */}
        {activeTab === 'academic' && (
          <div className="bg-[#0A192F] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-sky-400" />
              <span>Academic Records &amp; Percentages</span>
            </h3>

            {/* Current Education Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Current Education Status *
              </label>
              <select
                value={formData.currentEducationLevel}
                onChange={(e) => setFormData({ ...formData, currentEducationLevel: e.target.value })}
                className="w-full bg-slate-900 text-sm text-slate-100 px-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/40"
              >
                <option value="Intermediate / FSc (Completed)">Intermediate / FSc / A-Levels (Completed)</option>
                <option value="Bachelor (Ongoing)">Bachelor (Currently Enrolled / Ongoing)</option>
                <option value="Bachelor (Graduated)">Bachelor / 16 Years Degree (Completed)</option>
                <option value="Master / MS (Ongoing)">Master / MS / MPhil (Ongoing)</option>
                <option value="Master / MS (Graduated)">Master / MS / MPhil (Completed)</option>
              </select>
            </div>

            {/* Matriculation / Secondary Section */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-sky-300 uppercase tracking-wider flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  <span>1. Matriculation / Secondary School Certificate (SSC / O-Levels)</span>
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-sky-950 text-sky-300 border border-sky-800 font-bold">
                  {formData.matric.percentage || 0}%
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Obtained Marks</label>
                  <input
                    type="number"
                    value={formData.matric.marks}
                    onChange={(e) => handleMatricChange('marks', e.target.value)}
                    placeholder="e.g. 980"
                    className="w-full bg-slate-900 text-sm text-slate-100 px-3.5 py-2 rounded-xl border border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Total Marks</label>
                  <input
                    type="number"
                    value={formData.matric.totalMarks}
                    onChange={(e) => handleMatricChange('totalMarks', e.target.value)}
                    placeholder="e.g. 1100"
                    className="w-full bg-slate-900 text-sm text-slate-100 px-3.5 py-2 rounded-xl border border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Calculated Percentage</label>
                  <div className="w-full bg-slate-800/80 text-sm text-sky-300 font-bold px-3.5 py-2 rounded-xl border border-slate-700 flex items-center justify-between">
                    <span>{formData.matric.percentage || 0}%</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Intermediate / HSSC Section */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-sky-300 uppercase tracking-wider flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  <span>2. Intermediate / Higher Secondary School Certificate (HSSC / FSc / A-Levels)</span>
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-sky-950 text-sky-300 border border-sky-800 font-bold">
                  {formData.intermediate.percentage || 0}%
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Obtained Marks</label>
                  <input
                    type="number"
                    value={formData.intermediate.marks}
                    onChange={(e) => handleInterChange('marks', e.target.value)}
                    placeholder="e.g. 924"
                    className="w-full bg-slate-900 text-sm text-slate-100 px-3.5 py-2 rounded-xl border border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Total Marks</label>
                  <input
                    type="number"
                    value={formData.intermediate.totalMarks}
                    onChange={(e) => handleInterChange('totalMarks', e.target.value)}
                    placeholder="e.g. 1100"
                    className="w-full bg-slate-900 text-sm text-slate-100 px-3.5 py-2 rounded-xl border border-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Calculated Percentage</label>
                  <div className="w-full bg-slate-800/80 text-sm text-sky-300 font-bold px-3.5 py-2 rounded-xl border border-slate-700 flex items-center justify-between">
                    <span>{formData.intermediate.percentage || 0}%</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* University & Degree */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Current / Most Recent University (If applicable)
                </label>
                <input
                  type="text"
                  value={formData.currentUniversity || ''}
                  onChange={(e) => setFormData({ ...formData, currentUniversity: e.target.value })}
                  placeholder="e.g. FAST-NUCES, NUST, UET, Punjab University, COMSATS..."
                  className="w-full bg-slate-900 text-sm text-slate-100 px-4 py-2.5 rounded-xl border border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Current Degree / Major
                </label>
                <input
                  type="text"
                  value={formData.currentDegree || ''}
                  onChange={(e) => setFormData({ ...formData, currentDegree: e.target.value })}
                  placeholder="e.g. BS Computer Science / Software Engineering"
                  className="w-full bg-slate-900 text-sm text-slate-100 px-4 py-2.5 rounded-xl border border-slate-700"
                />
              </div>
            </div>

            {/* Projects & Achievements */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Key Academic Achievements &amp; Projects
              </label>
              <textarea
                rows={3}
                value={formData.achievementsAndProjects}
                onChange={(e) => setFormData({ ...formData, achievementsAndProjects: e.target.value })}
                placeholder="Mention real semester projects, final year design project, Hackathons, or published papers. The AI Application Assistant uses this real information to draft your SOP and CV."
                className="w-full bg-slate-900 text-sm text-slate-100 p-4 rounded-xl border border-slate-700 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        )}

        {/* TAB 3: LANGUAGES & PASSPORT */}
        {activeTab === 'languages' && (
          <div className="bg-[#0A192F] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-sky-400" />
              <span>Language Proficiency &amp; Passport Status</span>
            </h3>

            {/* Passport status */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                International Passport Status *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'have_valid_passport', label: 'Have Valid Passport', desc: 'Ready with 6+ months validity' },
                  { id: 'in_process', label: 'In Process', desc: 'Applied at NADRA / Passport office' },
                  { id: 'no_passport', label: 'No Passport Yet', desc: 'Will apply upon shortlisting' },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, passportStatus: p.id as any })}
                    className={`p-3.5 rounded-xl border text-left transition ${
                      formData.passportStatus === p.id
                        ? 'bg-sky-950 border-sky-500 text-white shadow-md'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold">{p.label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* English Proficiency */}
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h4 className="text-xs uppercase font-bold tracking-wider text-sky-400">
                English Language Certification
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Test or Proficiency Type</label>
                  <select
                    value={formData.englishProficiency.testType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        englishProficiency: {
                          ...formData.englishProficiency,
                          testType: e.target.value as any,
                        },
                      })
                    }
                    className="w-full bg-slate-900 text-sm text-slate-100 px-4 py-2.5 rounded-xl border border-slate-700"
                  >
                    <option value="english_medium_cert">English Medium of Instruction Certificate (University letter)</option>
                    <option value="ielts">IELTS Academic</option>
                    <option value="toefl">TOEFL iBT</option>
                    <option value="duolingo">Duolingo English Test</option>
                    <option value="none">No official test taken yet</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Score / Status</label>
                  <input
                    type="text"
                    value={formData.englishProficiency.score || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        englishProficiency: {
                          ...formData.englishProficiency,
                          score: e.target.value,
                        },
                      })
                    }
                    placeholder="e.g. 7.0 Overall Band or University Verified MOI"
                    className="w-full bg-slate-900 text-sm text-slate-100 px-4 py-2.5 rounded-xl border border-slate-700"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="hasCertificate"
                  checked={formData.englishProficiency.hasCertificate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      englishProficiency: {
                        ...formData.englishProficiency,
                        hasCertificate: e.target.checked,
                      },
                    })
                  }
                  className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4 bg-slate-900 border-slate-700"
                />
                <label htmlFor="hasCertificate" className="text-xs text-slate-300">
                  I possess an official stamped certificate / letter from my institution verifying English proficiency.
                </label>
              </div>
            </div>

            {/* Extracurriculars */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Extracurricular Activities &amp; Leadership Roles
              </label>
              <textarea
                rows={3}
                value={formData.extracurriculars}
                onChange={(e) => setFormData({ ...formData, extracurriculars: e.target.value })}
                placeholder="Mention societies, community volunteer work, sports, debate competitions, or leadership roles."
                className="w-full bg-slate-900 text-sm text-slate-100 p-4 rounded-xl border border-slate-700"
              />
            </div>
          </div>
        )}

        {/* TAB 4: PREFERENCES & DEGREE */}
        {activeTab === 'preferences' && (
          <div className="bg-[#0A192F] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-sky-400" />
              <span>Target Degree &amp; Preferred Destinations</span>
            </h3>

            {/* Desired Degree */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Desired Degree &amp; Field of Study *
              </label>
              <input
                type="text"
                required
                value={formData.desiredDegree}
                onChange={(e) => setFormData({ ...formData, desiredDegree: e.target.value })}
                placeholder="e.g. Master in Artificial Intelligence or BS Software Engineering"
                className="w-full bg-slate-900 text-sm text-slate-100 px-4 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-sky-500"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-[11px] text-slate-400 mr-1">Quick Suggestions:</span>
                {DESIRED_DEGREES_RECOMMENDED.slice(0, 6).map((deg) => (
                  <button
                    key={deg}
                    type="button"
                    onClick={() => setFormData({ ...formData, desiredDegree: deg })}
                    className="text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-sky-300 px-2.5 py-0.5 rounded-full border border-slate-800 transition"
                  >
                    + {deg}
                  </button>
                ))}
              </div>
            </div>

            {/* Funding Requirement */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Funding Requirement *
              </label>
              <select
                value={formData.fundingRequirement}
                onChange={(e) => setFormData({ ...formData, fundingRequirement: e.target.value as any })}
                className="w-full bg-slate-900 text-sm text-slate-100 px-4 py-2.5 rounded-xl border border-slate-700"
              >
                <option value="fully_funded">Fully Funded (Tuition + Monthly Stipend + Airfare + Accommodation)</option>
                <option value="tuition_waiver">Tuition Fee Waiver (100% Free Tuition)</option>
                <option value="partial_funding">Partial Funding / Research Assistantship</option>
                <option value="any">Any Funding Model</option>
              </select>
            </div>

            {/* Preferred Countries Multiselect */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Preferred Destination Countries (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-2">
                {COUNTRIES_OPTIONS.map((c) => {
                  const isSelected = (formData.preferredCountries || []).includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleCountryPreference(c)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-sky-600 text-white border-sky-500 shadow-md shadow-sky-600/20'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <span>{c}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Action Controls & Notifications */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <div>
            {saveSuccess && (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1.5 rounded-xl animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>Profile saved and synchronized to Firestore successfully!</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
              className="px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-900 transition flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Profile</span>
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20 transition active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </div>

        {/* Delete Confirmation Alert */}
        {showDeleteConfirm && (
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-rose-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Are you sure you want to clear your saved profile and documents data?</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1 rounded-lg text-xs bg-slate-800 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await deleteStudentProfile();
                  setShowDeleteConfirm(false);
                }}
                className="px-3 py-1 rounded-lg text-xs bg-rose-600 text-white font-semibold"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        )}

      </form>
    </div>
  );
};
