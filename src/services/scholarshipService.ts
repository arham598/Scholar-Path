import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  Scholarship, 
  SavedScholarship, 
  DocumentItem, 
  ApplicationDraft 
} from '../types/scholarship';
import { INITIAL_SCHOLARSHIPS } from '../data/scholarshipsData';

const DEFAULT_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-matric',
    documentType: 'matric_cert',
    title: 'Matriculation Certificate & Marksheet (SSC)',
    description: 'Original certificate from BISE Board. IBCC attestation required for international scholarships.',
    status: 'ready',
    fileName: 'Matric_Certificate_BISE.pdf',
    fileSize: '1.4 MB',
    attestationRequired: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'doc-inter',
    documentType: 'inter_cert',
    title: 'Intermediate Certificate & Marksheet (HSSC / FSc)',
    description: 'Higher secondary school certificate. Requires IBCC verification & attestation stamps.',
    status: 'ready',
    fileName: 'Intermediate_FSc_PreEngineering.pdf',
    fileSize: '1.8 MB',
    attestationRequired: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'doc-transcript',
    documentType: 'transcript',
    title: 'University Official Transcripts & Degree',
    description: 'Semester-by-semester official transcript issued by university controller of examinations. HEC attestation required.',
    status: 'in_progress',
    notes: 'Requested official sealed duplicate copy from FAST Registrar Office.',
    attestationRequired: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'doc-passport',
    documentType: 'passport',
    title: 'Machine Readable International Passport',
    description: 'Must have at least 6 months validity beyond your intended entry date.',
    status: 'ready',
    fileName: 'Passport_Data_Page_Scan.pdf',
    fileSize: '820 KB',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'doc-cv',
    documentType: 'cv',
    title: 'Europass / Academic Curriculum Vitae (CV)',
    description: 'Professional academic resume highlighting research projects, grades, and technical tools.',
    status: 'ready',
    fileName: 'Academic_CV_Daniyal.pdf',
    fileSize: '450 KB',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'doc-motivation',
    documentType: 'motivation_letter',
    title: 'Statement of Purpose / Letter of Motivation',
    description: 'Tailored 1–2 page essay explaining your academic motivations, research objectives, and home country return plan.',
    status: 'in_progress',
    notes: 'Drafted using ScholarPath AI Assistant; currently refining conclusion.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'doc-rec-1',
    documentType: 'recommendation_letter',
    title: 'Academic Recommendation Letter 1 (Professor / HoD)',
    description: 'Signed and stamped reference letter on official university letterhead from senior faculty.',
    status: 'ready',
    fileName: 'Reference_Letter_Dr_Asim_FAST.pdf',
    fileSize: '510 KB',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'doc-rec-2',
    documentType: 'recommendation_letter',
    title: 'Academic Recommendation Letter 2 (Project Advisor)',
    description: 'Second academic reference detailing project work and academic competence.',
    status: 'missing',
    notes: 'Need to follow up with Final Year Project advisor next Tuesday.',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'doc-language',
    documentType: 'language_cert',
    title: 'English Language Certificate / MOI Letter',
    description: 'IELTS / TOEFL scorecard or English as Medium of Instruction certificate from university registrar.',
    status: 'ready',
    fileName: 'FAST_English_Medium_Instruction_Certificate.pdf',
    fileSize: '620 KB',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'doc-financial',
    documentType: 'financial_docs',
    title: 'Financial Affidavit / Income Certification',
    description: 'Required for need-based aid (e.g., Ehsaas, PEEF, Italian DSU ISEE Parificato). Parents salary slips & bank certificates.',
    status: 'in_progress',
    notes: 'Gathering electricity utility bills and father income certificate.',
    updatedAt: new Date().toISOString(),
  },
];

// In-memory / local storage cache to ensure snappy performance
let localScholarshipsCache: Scholarship[] = [...INITIAL_SCHOLARSHIPS];

export const scholarshipService = {
  // Fetch all scholarships
  async getScholarships(): Promise<Scholarship[]> {
    try {
      const snap = await getDocs(collection(db, 'scholarships'));
      if (!snap.empty) {
        const firestoreList: Scholarship[] = [];
        snap.forEach((d) => firestoreList.push({ id: d.id, ...d.data() } as Scholarship));
        localScholarshipsCache = firestoreList;
        return firestoreList;
      }
    } catch (err) {
      console.warn('Firestore fetch scholarships notice (using verified directory):', err);
    }
    return localScholarshipsCache;
  },

  // Seed initial scholarships to Firestore (Admin tool)
  async seedScholarshipsToFirestore(): Promise<{ count: number }> {
    let count = 0;
    for (const item of INITIAL_SCHOLARSHIPS) {
      try {
        await setDoc(doc(db, 'scholarships', item.id), item);
        count++;
      } catch (e) {
        console.warn(`Failed to seed ${item.id}:`, e);
      }
    }
    return { count };
  },

  // Save / Bookmark scholarship
  async saveScholarship(userId: string, scholarship: Scholarship): Promise<SavedScholarship> {
    const savedItem: SavedScholarship = {
      id: scholarship.id,
      scholarshipId: scholarship.id,
      scholarshipName: scholarship.name,
      country: scholarship.country,
      fundingCoverage: scholarship.fundingCoverage,
      savedAt: new Date().toISOString(),
      deadline: scholarship.applicationClosingDate,
      status: 'saved',
      reminderSet: true,
    };

    const saved = this.getLocalSavedScholarships();
    const existingIndex = saved.findIndex((s) => s.scholarshipId === scholarship.id);
    if (existingIndex >= 0) {
      saved[existingIndex] = savedItem;
    } else {
      saved.push(savedItem);
    }
    localStorage.setItem('scholarpath_saved_scholarships', JSON.stringify(saved));

    if (userId && !userId.startsWith('demo-')) {
      try {
        await setDoc(doc(db, 'users', userId, 'savedScholarships', scholarship.id), savedItem);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${userId}/savedScholarships/${scholarship.id}`);
      }
    }

    return savedItem;
  },

  // Remove saved scholarship
  async removeSavedScholarship(userId: string, scholarshipId: string): Promise<void> {
    const saved = this.getLocalSavedScholarships().filter((s) => s.scholarshipId !== scholarshipId);
    localStorage.setItem('scholarpath_saved_scholarships', JSON.stringify(saved));

    if (userId && !userId.startsWith('demo-')) {
      try {
        await deleteDoc(doc(db, 'users', userId, 'savedScholarships', scholarshipId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `users/${userId}/savedScholarships/${scholarshipId}`);
      }
    }
  },

  // Update status of saved scholarship (e.g. from 'saved' to 'preparing' or 'submitted')
  async updateSavedScholarshipStatus(
    userId: string,
    scholarshipId: string,
    status: SavedScholarship['status'],
    notes?: string
  ): Promise<void> {
    const saved = this.getLocalSavedScholarships();
    const target = saved.find((s) => s.scholarshipId === scholarshipId);
    if (target) {
      target.status = status;
      if (notes !== undefined) target.notes = notes;
      localStorage.setItem('scholarpath_saved_scholarships', JSON.stringify(saved));

      if (userId && !userId.startsWith('demo-')) {
        try {
          await updateDoc(doc(db, 'users', userId, 'savedScholarships', scholarshipId), {
            status,
            ...(notes !== undefined ? { notes } : {}),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `users/${userId}/savedScholarships/${scholarshipId}`);
        }
      }
    }
  },

  getLocalSavedScholarships(): SavedScholarship[] {
    const data = localStorage.getItem('scholarpath_saved_scholarships');
    if (!data) {
      // Provide initial demo saved items
      const initial: SavedScholarship[] = [
        {
          id: 'daad-helmut-schmidt-de',
          scholarshipId: 'daad-helmut-schmidt-de',
          scholarshipName: 'DAAD Helmut-Schmidt-Programme (Master of Public Policy and Governance)',
          country: 'Germany',
          fundingCoverage: 'fully_funded',
          savedAt: '2026-08-10T10:00:00.000Z',
          deadline: '2026-07-31',
          status: 'preparing',
          notes: 'Waiting for 2nd academic reference from FYP mentor.',
          reminderSet: true,
        },
        {
          id: 'dsu-toscana-it',
          scholarshipId: 'dsu-toscana-it',
          scholarshipName: 'DSU Regional Scholarship Italy (Tuscany / Pisa / Florence / Siena)',
          country: 'Italy',
          fundingCoverage: 'fully_funded',
          savedAt: '2026-08-12T14:30:00.000Z',
          deadline: '2026-09-06',
          status: 'saved',
          notes: 'Need to prepare ISEE Parificato documentation with family income certificates.',
          reminderSet: true,
        },
      ];
      localStorage.setItem('scholarpath_saved_scholarships', JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  // Document Checklist operations
  getDocuments(): DocumentItem[] {
    const data = localStorage.getItem('scholarpath_documents');
    if (!data) {
      localStorage.setItem('scholarpath_documents', JSON.stringify(DEFAULT_DOCUMENTS));
      return DEFAULT_DOCUMENTS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return DEFAULT_DOCUMENTS;
    }
  },

  async updateDocument(userId: string, docItem: DocumentItem): Promise<void> {
    const docs = this.getDocuments();
    const index = docs.findIndex((d) => d.id === docItem.id);
    if (index >= 0) {
      docs[index] = { ...docItem, updatedAt: new Date().toISOString() };
    } else {
      docs.push({ ...docItem, updatedAt: new Date().toISOString() });
    }
    localStorage.setItem('scholarpath_documents', JSON.stringify(docs));

    if (userId && !userId.startsWith('demo-')) {
      try {
        await setDoc(doc(db, 'users', userId, 'documents', docItem.id), docItem);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${userId}/documents/${docItem.id}`);
      }
    }
  },

  // Application drafts operations
  getDrafts(): ApplicationDraft[] {
    const data = localStorage.getItem('scholarpath_drafts');
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  async saveDraft(userId: string, draft: ApplicationDraft): Promise<void> {
    const drafts = this.getDrafts();
    const index = drafts.findIndex((d) => d.id === draft.id);
    if (index >= 0) {
      drafts[index] = { ...draft, updatedAt: new Date().toISOString() };
    } else {
      drafts.unshift({ ...draft, updatedAt: new Date().toISOString() });
    }
    localStorage.setItem('scholarpath_drafts', JSON.stringify(drafts));

    if (userId && !userId.startsWith('demo-')) {
      try {
        await setDoc(doc(db, 'users', userId, 'drafts', draft.id), draft);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${userId}/drafts/${draft.id}`);
      }
    }
  },

  async deleteDraft(userId: string, draftId: string): Promise<void> {
    const drafts = this.getDrafts().filter((d) => d.id !== draftId);
    localStorage.setItem('scholarpath_drafts', JSON.stringify(drafts));

    if (userId && !userId.startsWith('demo-')) {
      try {
        await deleteDoc(doc(db, 'users', userId, 'drafts', draftId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `users/${userId}/drafts/${draftId}`);
      }
    }
  },

  // Admin: create or update official scholarship record
  async upsertScholarship(scholarship: Scholarship): Promise<void> {
    const index = localScholarshipsCache.findIndex((s) => s.id === scholarship.id);
    const updated = {
      ...scholarship,
      lastVerifiedDate: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString(),
    };

    if (index >= 0) {
      localScholarshipsCache[index] = updated;
    } else {
      localScholarshipsCache.unshift(updated);
    }

    try {
      await setDoc(doc(db, 'scholarships', scholarship.id), updated);
    } catch (err) {
      console.warn('Notice: Firestore admin write restricted or using cache:', err);
    }
  },

  // Admin: mark scholarship expired
  async toggleScholarshipExpired(scholarshipId: string, isExpired: boolean): Promise<void> {
    const target = localScholarshipsCache.find((s) => s.id === scholarshipId);
    if (target) {
      target.isExpired = isExpired;
      target.lastVerifiedDate = new Date().toISOString().split('T')[0];
      try {
        await updateDoc(doc(db, 'scholarships', scholarshipId), {
          isExpired,
          lastVerifiedDate: target.lastVerifiedDate,
        });
      } catch (e) {
        console.warn('Firestore toggle notice:', e);
      }
    }
  },
};
