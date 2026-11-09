import React, { useState } from 'react';
import { 
  Sparkles, 
  FileText, 
  Copy, 
  Check, 
  Download, 
  Save, 
  Trash2, 
  RefreshCw, 
  AlertCircle,
  FolderOpen,
  Send,
  HelpCircle,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Scholarship, DraftType, ApplicationDraft } from '../../types/scholarship';
import { generateApplicationDraft } from '../../services/aiAssistantService';
import { scholarshipService } from '../../services/scholarshipService';

interface ApplicationAssistantViewProps {
  scholarships: Scholarship[];
  preselectedScholarship?: Scholarship | null;
}

export const ApplicationAssistantView: React.FC<ApplicationAssistantViewProps> = ({
  scholarships,
  preselectedScholarship,
}) => {
  const { user, profile } = useAuth();

  const [documentType, setDocumentType] = useState<DraftType>('motivation_letter');
  const [targetScholarshipId, setTargetScholarshipId] = useState<string>(
    preselectedScholarship ? preselectedScholarship.id : (scholarships[0]?.id || '')
  );
  const [customInstructions, setCustomInstructions] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedDraft, setGeneratedDraft] = useState<ApplicationDraft | null>(null);
  const [editableContent, setEditableContent] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [savedDrafts, setSavedDrafts] = useState<ApplicationDraft[]>(scholarshipService.getDrafts());
  const [activeTab, setActiveTab] = useState<'generator' | 'saved'>('generator');

  const selectedScholarship = scholarships.find((s) => s.id === targetScholarshipId);

  const documentTypesList = [
    { id: 'motivation_letter' as DraftType, label: 'Motivation Letter', desc: 'Personal rationale and scholarship alignment' },
    { id: 'statement_of_purpose' as DraftType, label: 'Statement of Purpose (SOP)', desc: 'Academic background & research trajectory' },
    { id: 'cv' as DraftType, label: 'Scholarship CV Summary', desc: 'Executive summary & project bullet points' },
    { id: 'scholarship_email' as DraftType, label: 'Scholarship / Professor Email', desc: 'Polite inquiry for supervisor / admissions' },
    { id: 'recommendation_request' as DraftType, label: 'Recommendation Letter Request', desc: 'Formal request to professor or employer' },
    { id: 'personal_statement' as DraftType, label: 'Personal Statement', desc: 'Narrative of resilience and intellectual journey' },
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const draft = await generateApplicationDraft({
        type: documentType,
        studentProfile: profile,
        scholarship: selectedScholarship,
        customPrompt: customInstructions,
      });
      setGeneratedDraft(draft);
      setEditableContent(draft.content);
    } catch (err) {
      console.error('Failed to generate draft:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editableContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const filename = `${documentType}-${selectedScholarship ? selectedScholarship.country : 'scholarship'}.txt`.toLowerCase();
    const blob = new Blob([editableContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveToProfile = async () => {
    if (!editableContent.trim()) return;
    const draftToSave: ApplicationDraft = {
      id: generatedDraft?.id || 'draft-' + Date.now(),
      type: documentType,
      scholarshipId: selectedScholarship?.id,
      scholarshipName: selectedScholarship?.name,
      title: generatedDraft?.title || `${documentType.replace('_', ' ')} Draft`,
      content: editableContent,
      createdAt: generatedDraft?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await scholarshipService.saveDraft(user?.uid || 'demo-user', draftToSave);
    setSavedDrafts(scholarshipService.getDrafts());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleDeleteSavedDraft = async (id: string) => {
    await scholarshipService.deleteDraft(user?.uid || 'demo-user', id);
    setSavedDrafts(scholarshipService.getDrafts());
  };

  const handleLoadDraft = (draft: ApplicationDraft) => {
    setDocumentType(draft.type);
    if (draft.scholarshipId) setTargetScholarshipId(draft.scholarshipId);
    setGeneratedDraft(draft);
    setEditableContent(draft.content);
    setActiveTab('generator');
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      
      {/* Header Banner */}
      <div className="bg-[#0A192F] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-800 text-xs font-semibold text-sky-300">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Module 4 — AI Application Assistant (Strictly Authentic)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Scholarship Application Assistant
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Generate structured, high-impact drafts powered by Gemini 3.8 Flash. Grounded strictly in your real academic credentials, actual grades (Intermediate {profile.intermediate?.percentage}%), and real projects without fabrication.
            </p>
          </div>

          <div className="flex items-center bg-slate-900 p-1.5 rounded-2xl border border-slate-800 shrink-0">
            <button
              onClick={() => setActiveTab('generator')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'generator' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Draft Generator
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'saved' ? 'bg-sky-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              My Saved Drafts ({savedDrafts.length})
            </button>
          </div>
        </div>

        {/* Ethical Anti-Fabrication Notice */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex items-start gap-2.5 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <span>
            Anti-Fabrication Policy: The assistant uses only the academic grades, activities, and degrees you provided in your profile. Review and personalize every draft before submitting. Applications are never submitted automatically.
          </span>
        </div>
      </div>

      {activeTab === 'generator' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Controls Column (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-[#0A192F] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-400" />
                <span>1. Select Document Type</span>
              </h3>

              <div className="space-y-2">
                {documentTypesList.map((dt) => (
                  <button
                    key={dt.id}
                    onClick={() => setDocumentType(dt.id)}
                    className={`w-full p-3 rounded-2xl border text-left transition flex items-start justify-between ${
                      documentType === dt.id
                        ? 'bg-sky-950/80 border-sky-500 text-white shadow-md'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{dt.label}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{dt.desc}</div>
                    </div>
                    {documentType === dt.id && <Check className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />}
                  </button>
                ))}
              </div>

              {/* Target Scholarship Selection */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  2. Target Scholarship Context
                </label>
                <select
                  value={targetScholarshipId}
                  onChange={(e) => setTargetScholarshipId(e.target.value)}
                  className="w-full bg-slate-900 text-xs text-slate-100 p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-sky-500"
                >
                  <option value="">General (No Specific Scholarship)</option>
                  {scholarships.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.destinationFlag} {s.name} ({s.country})
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Guidance Instructions */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  3. Custom Emphasis or Tone (Optional)
                </label>
                <textarea
                  rows={3}
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="e.g. Focus on my final year Machine Learning project; emphasize financial need for tuition; mention interest in renewable energy..."
                  className="w-full bg-slate-900 text-xs text-slate-100 p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20 transition active:scale-95"
              >
                <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? 'Generating Authentic Draft...' : 'Generate Application Draft'}</span>
              </button>

            </div>
          </div>

          {/* Draft Display & Editor Column (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-[#0A192F] border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col h-full min-h-[500px]">
              
              {/* Editor Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="font-bold text-white text-base">
                    {generatedDraft?.title || 'Live Application Editor'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Review, customize, and copy your personalized draft.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    disabled={!editableContent}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition"
                    title="Copy text to clipboard"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={handleDownload}
                    disabled={!editableContent}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition"
                    title="Download as .txt"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>

                  <button
                    onClick={handleSaveToProfile}
                    disabled={!editableContent}
                    className="px-3.5 py-1.5 rounded-lg bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-800 text-xs font-bold flex items-center gap-1.5 transition"
                    title="Save to your profile drafts"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{savedSuccess ? 'Saved!' : 'Save Draft'}</span>
                  </button>
                </div>
              </div>

              {/* Editor Textarea */}
              <div className="flex-1 py-4">
                {editableContent ? (
                  <textarea
                    value={editableContent}
                    onChange={(e) => setEditableContent(e.target.value)}
                    rows={18}
                    className="w-full h-full bg-slate-900/90 text-slate-100 text-sm p-4 rounded-2xl border border-slate-700/80 focus:outline-none focus:border-sky-500 font-mono leading-relaxed"
                  />
                ) : (
                  <div className="h-full min-h-[350px] flex flex-col items-center justify-center text-center p-8 text-slate-400 border border-dashed border-slate-800 rounded-2xl">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-500 mb-3">
                      <FileText className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-300">No Draft Generated Yet</p>
                    <p className="text-xs text-slate-400 max-w-sm mt-1">
                      Choose a document type and target scholarship on the left, then click <strong>&quot;Generate Application Draft&quot;</strong>.
                    </p>
                  </div>
                )}
              </div>

              {/* Word & Character Count Footer */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>
                  Words: <strong className="text-slate-200">{editableContent ? editableContent.trim().split(/\s+/).length : 0}</strong> | Characters: <strong className="text-slate-200">{editableContent.length}</strong>
                </span>
                <span className="text-[11px] text-sky-400">
                  Ready to copy into university or scholarship portal
                </span>
              </div>

            </div>
          </div>

        </div>
      ) : (
        /* Saved Drafts Repository */
        <div className="bg-[#0A192F] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-sky-400" />
            <span>Saved Application Documents ({savedDrafts.length})</span>
          </h3>

          {savedDrafts.length === 0 ? (
            <div className="p-8 text-center text-slate-400 border border-dashed border-slate-800 rounded-2xl">
              <p className="text-sm font-semibold text-slate-300">No saved drafts yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Generate a document and click &quot;Save Draft&quot; to keep your motivation letters and essays organized here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedDrafts.map((d) => (
                <div
                  key={d.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="uppercase font-bold tracking-wider text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                        {d.type.replace(/_/g, ' ')}
                      </span>
                      <span>{new Date(d.updatedAt).toLocaleDateString()}</span>
                    </div>
                    <h4 className="font-bold text-white text-sm line-clamp-1">{d.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-3 font-mono bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                      {d.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => handleLoadDraft(d)}
                      className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <span>Load into Editor</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteSavedDraft(d.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition"
                      title="Delete draft"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
