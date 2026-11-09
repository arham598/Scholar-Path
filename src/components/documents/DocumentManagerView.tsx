import React, { useState } from 'react';
import { 
  FolderCheck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Upload, 
  FileText, 
  Edit3, 
  Info, 
  ShieldCheck, 
  Save, 
  HelpCircle,
  FileBadge
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DocumentItem, DocumentStatus } from '../../types/scholarship';
import { scholarshipService } from '../../services/scholarshipService';

export const DocumentManagerView: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentItem[]>(scholarshipService.getDocuments());
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState<string>('');
  const [selectedGuideDoc, setSelectedGuideDoc] = useState<string | null>('doc-inter');

  const readyCount = documents.filter((d) => d.status === 'ready' || d.status === 'verified').length;
  const inProgressCount = documents.filter((d) => d.status === 'in_progress').length;
  const missingCount = documents.filter((d) => d.status === 'missing').length;
  const progressPercent = Math.round((readyCount / documents.length) * 100);

  const handleStatusChange = async (docItem: DocumentItem, newStatus: DocumentStatus) => {
    const updated: DocumentItem = {
      ...docItem,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };
    await scholarshipService.updateDocument(user?.uid || 'demo-user', updated);
    setDocuments(scholarshipService.getDocuments());
  };

  const handleSaveNotes = async (docItem: DocumentItem) => {
    const updated: DocumentItem = {
      ...docItem,
      notes: tempNotes,
      updatedAt: new Date().toISOString(),
    };
    await scholarshipService.updateDocument(user?.uid || 'demo-user', updated);
    setDocuments(scholarshipService.getDocuments());
    setEditingDocId(null);
  };

  const handleSimulateUpload = async (docItem: DocumentItem, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      const updated: DocumentItem = {
        ...docItem,
        status: 'ready',
        fileName: file.name,
        fileSize: fileSizeMB,
        updatedAt: new Date().toISOString(),
      };
      await scholarshipService.updateDocument(user?.uid || 'demo-user', updated);
      setDocuments(scholarshipService.getDocuments());
    }
  };

  const attestationGuides: Record<string, { title: string; steps: string[]; feeEstimate: string; timing: string }> = {
    'doc-matric': {
      title: 'Matriculation (SSC) IBCC Attestation Guide',
      steps: [
        'Obtain original certificate and mark sheet issued by your Board of Intermediate & Secondary Education (BISE).',
        'Book online appointment on the official IBCC Attestation Portal (https://attest.ibcc.edu.pk).',
        'Submit original documents with photocopies and CNIC/B-Form copy at your regional IBCC center (Islamabad, Lahore, Karachi, Peshawar, Quetta, Bahawalpur).',
        'Verify that QR-coded security stamp is embossed on the reverse of the original certificate.'
      ],
      feeEstimate: 'PKR 1,200 – 1,800 per document',
      timing: '3 to 5 business days'
    },
    'doc-inter': {
      title: 'Intermediate (HSSC / FSc) IBCC Attestation Guide',
      steps: [
        'Ensure name spelling matches your machine-readable passport letter by letter.',
        'Submit verified duplicate transcript/sanad from relevant BISE board if requested.',
        'Book appointment through IBCC e-portal and select TCS courier or personal appearance.',
        'Required for all European (DAAD, Italy DSU, Hungary Stipendium) and Asian government scholarships.'
      ],
      feeEstimate: 'PKR 1,200 – 1,800 per document',
      timing: '3 to 5 business days'
    },
    'doc-transcript': {
      title: 'University Degree & Transcript HEC Attestation Guide',
      steps: [
        'Register an account on HEC e-portal (https://eservices.hec.gov.pk).',
        'Upload clear color scans of Matric (IBCC attested), Inter (IBCC attested), and university degree transcripts.',
        'Pay attestation fee via 1Link / online banking Challan.',
        'Choose Urgent Walk-in or TCS courier mode.',
        'Ensure HEC stamp with ticket number and verification stamp is affixed.'
      ],
      feeEstimate: 'PKR 1,000 per original document, PKR 700 per copy',
      timing: '1 day (Walk-in) or 10–14 days (Courier)'
    },
    'doc-language': {
      title: 'English as Medium of Instruction (MOI) Certificate Guide',
      steps: [
        'Visit your university Registrar Office or Controller of Examinations.',
        'Request an official "English Proficiency / Medium of Instruction Certificate" printed on university letterhead.',
        'The letter must state: "It is certified that the medium of instruction and examination for [Degree Name] was English."',
        'Universities in Italy, Türkiye, Hungary, China, and South Korea widely accept this certificate in lieu of IELTS.'
      ],
      feeEstimate: 'PKR 500 – 1,500 (dependent on university)',
      timing: '1 to 3 days'
    },
    'doc-financial': {
      title: 'Italy ISEE Parificato / Financial Affidavit Guide',
      steps: [
        'Gather parents salary certificate or income declaration attested by relevant authority / employer.',
        'Obtain FBR tax returns (if filer) or income certificate from Union Council / Tehsildar.',
        'Collect bank statement of last 12 months with bank manager stamp.',
        'Translate documents into Italian through an authorized embassy translator.',
        'Legalize at the Italian Embassy / Consulate in Islamabad or Karachi for DSU scholarship.'
      ],
      feeEstimate: 'Translator charges vary (approx. PKR 1,500/page)',
      timing: '2 to 3 weeks'
    }
  };

  const activeGuide = selectedGuideDoc ? attestationGuides[selectedGuideDoc] : attestationGuides['doc-inter'];

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      
      {/* Header Banner */}
      <div className="bg-[#0A192F] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-800 text-xs font-semibold text-sky-300">
              <FolderCheck className="w-3.5 h-3.5" />
              <span>Module 5 — Comprehensive Application Document Manager</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Application Document Checklist
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Track the preparation of required Pakistani and international documents (IBCC &amp; HEC attestations, valid passport, English Medium of Instruction letter, and recommendation letters).
            </p>
          </div>

          {/* Readiness Gauge */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4 shrink-0">
            <div className="text-right">
              <div className="text-xs text-slate-400">Preparation Progress</div>
              <div className="text-2xl font-extrabold text-white">{progressPercent}%</div>
              <div className="text-[10px] text-emerald-400 font-medium">
                {readyCount} of {documents.length} ready
              </div>
            </div>

            <div className="w-12 h-12 rounded-full border-4 border-slate-800 border-t-sky-500 border-r-sky-500 flex items-center justify-center font-bold text-xs text-sky-400">
              {readyCount}/{documents.length}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6 w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
          <div 
            className="bg-gradient-to-r from-sky-600 via-sky-400 to-emerald-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Stats summary pills */}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Ready / Verified: {readyCount}</span>
          </span>
          <span className="px-3 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-800 font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>In Progress: {inProgressCount}</span>
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Pending: {missingCount}</span>
          </span>
        </div>
      </div>

      {/* Main Grid: Checklist & Attestation Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Document Checklist Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-white text-base">Checklist Items</h3>
            <span className="text-xs text-slate-400">Click guide to view attestation instructions</span>
          </div>

          <div className="space-y-3">
            {documents.map((doc) => {
              const isReady = doc.status === 'ready' || doc.status === 'verified';
              const isInProgress = doc.status === 'in_progress';
              const isEditing = editingDocId === doc.id;

              return (
                <div
                  key={doc.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isReady
                      ? 'bg-[#0A192F]/90 border-slate-800'
                      : isInProgress
                      ? 'bg-amber-950/20 border-amber-900/40'
                      : 'bg-slate-900/60 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          {doc.title}
                        </span>

                        {doc.attestationRequired && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-950 text-blue-300 border border-blue-800">
                            Attestation Required
                          </span>
                        )}

                        {attestationGuides[doc.id] && (
                          <button
                            onClick={() => setSelectedGuideDoc(doc.id)}
                            className="text-[10px] text-sky-400 hover:underline flex items-center gap-0.5"
                          >
                            <Info className="w-3 h-3" />
                            <span>View Guide</span>
                          </button>
                        )}
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed">
                        {doc.description}
                      </p>

                      {/* File Reference if attached */}
                      {doc.fileName && (
                        <div className="inline-flex items-center gap-1.5 text-xs text-sky-300 bg-sky-950/80 px-2.5 py-1 rounded-lg border border-sky-800/80 mt-1">
                          <FileText className="w-3.5 h-3.5" />
                          <span className="font-mono text-[11px]">{doc.fileName}</span>
                          {doc.fileSize && <span className="text-slate-400">({doc.fileSize})</span>}
                        </div>
                      )}

                      {/* Notes snippet */}
                      {doc.notes && !isEditing && (
                        <p className="text-xs text-slate-300 bg-slate-950/60 p-2 rounded-lg border border-slate-800 mt-1.5 italic">
                          &quot;{doc.notes}&quot;
                        </p>
                      )}

                      {/* Edit Notes field */}
                      {isEditing && (
                        <div className="mt-2 space-y-2">
                          <textarea
                            value={tempNotes}
                            onChange={(e) => setTempNotes(e.target.value)}
                            placeholder="Add tracking notes (e.g., Token number, TCS tracking, appointment date)..."
                            className="w-full bg-slate-900 text-xs text-slate-100 p-2.5 rounded-xl border border-slate-700"
                            rows={2}
                          />
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleSaveNotes(doc)}
                              className="px-3 py-1 rounded-lg bg-sky-600 text-white text-xs font-semibold"
                            >
                              Save Note
                            </button>
                            <button
                              onClick={() => setEditingDocId(null)}
                              className="px-3 py-1 rounded-lg bg-slate-800 text-slate-400 text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Status Toggle Buttons */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <select
                        value={doc.status}
                        onChange={(e) => handleStatusChange(doc, e.target.value as DocumentStatus)}
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl border focus:outline-none ${
                          isReady
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : isInProgress
                            ? 'bg-amber-950 text-amber-300 border-amber-800'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        <option value="missing">Pending / Missing</option>
                        <option value="in_progress">In Progress</option>
                        <option value="ready">Ready (Scanned)</option>
                        <option value="verified">Officially Attested</option>
                      </select>

                      <div className="flex items-center gap-1.5">
                        {/* Attach File simulation */}
                        <label 
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer transition"
                          title="Attach scanned document reference"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => handleSimulateUpload(doc, e)}
                          />
                        </label>

                        {/* Edit Note button */}
                        <button
                          onClick={() => {
                            setEditingDocId(doc.id);
                            setTempNotes(doc.notes || '');
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                          title="Add/edit notes"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Attestation Guides & FAQ (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#0A192F] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 sticky top-20">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
              <FileBadge className="w-5 h-5" />
              <span>Official Attestation &amp; Verification Guide</span>
            </div>

            {activeGuide ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-base font-bold text-white tracking-tight">
                    {activeGuide.title}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span>Est. Fee: <strong className="text-emerald-400">{activeGuide.feeEstimate}</strong></span>
                    <span>•</span>
                    <span>Processing: <strong className="text-sky-300">{activeGuide.timing}</strong></span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <span className="text-xs uppercase font-bold tracking-wider text-slate-400 block">
                    Procedural Steps
                  </span>
                  <ul className="space-y-2">
                    {activeGuide.steps.map((st, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                        <span className="w-4 h-4 rounded-full bg-sky-950 text-sky-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 border border-sky-800">
                          {i + 1}
                        </span>
                        <span className="leading-relaxed">{st}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Select a document guide on the left to read step-by-step attestation instructions.</p>
            )}

            {/* Quick Tips Box */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <AlertCircle className="w-4 h-4" />
                <span>Crucial Pakistan Attestation Sequence</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Always attest Matric &amp; Intermediate from <strong>IBCC first</strong> before attempting HEC degree attestation. HEC will reject applications if secondary school certificates lack IBCC verification stamps.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
