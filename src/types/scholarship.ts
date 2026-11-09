export type DegreeLevel = 'High School' | 'Bachelor' | 'Master' | 'PhD' | 'Postdoc' | 'Exchange';

export type FundingType = 'fully_funded' | 'tuition_waiver' | 'partial_funding';

export type EligibilityStatus = 'eligible' | 'potentially_eligible' | 'not_eligible' | 'missing_info';

export type DocumentType = 
  | 'matric_cert'
  | 'inter_cert'
  | 'transcript'
  | 'passport'
  | 'cv'
  | 'motivation_letter'
  | 'recommendation_letter'
  | 'language_cert'
  | 'financial_docs'
  | 'other';

export type DocumentStatus = 'missing' | 'in_progress' | 'ready' | 'verified';

export type ApplicationStatus = 'saved' | 'preparing' | 'submitted' | 'awarded' | 'rejected';

export type DraftType = 
  | 'motivation_letter'
  | 'statement_of_purpose'
  | 'cv'
  | 'scholarship_email'
  | 'recommendation_request'
  | 'personal_statement'
  | 'custom_answer';

export interface AcademicRecord {
  marks: string;
  totalMarks: string;
  percentage: number;
}

export interface EnglishProficiency {
  testType: 'ielts' | 'toefl' | 'duolingo' | 'english_medium_cert' | 'none';
  score?: string;
  hasCertificate: boolean;
}

export interface StudentProfile {
  id?: string;
  fullName: string;
  email: string;
  nationality: string;
  countryOfResidence: string;
  dateOfBirth?: string;
  currentEducationLevel: string;
  matric: AcademicRecord;
  intermediate: AcademicRecord;
  currentUniversity?: string;
  currentDegree?: string;
  desiredDegree: string;
  preferredCountries: string[];
  familyIncomeRange?: string; // Optional for need-based aid only
  passportStatus: 'have_valid_passport' | 'in_process' | 'no_passport';
  englishProficiency: EnglishProficiency;
  extracurriculars: string;
  achievementsAndProjects: string;
  fundingRequirement: 'fully_funded' | 'tuition_waiver' | 'partial_funding' | 'any';
  role?: 'student' | 'admin';
  createdAt?: string;
  updatedAt?: string;
}

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  country: string;
  destinationFlag: string;
  degreeLevels: DegreeLevel[];
  eligibleNationalities: string[];
  minPercentage?: number;
  minGPA?: number;
  academicRequirements: string;
  ageRestrictions?: string;
  maxAge?: number;
  languageRequirements: {
    accepted: string[];
    minScore?: string;
    englishMediumWaiver: boolean;
    description: string;
  };
  fundingCoverage: FundingType;
  fundingDetails: string;
  applicationOpeningDate: string;
  applicationClosingDate: string;
  requiredDocuments: string[];
  officialApplicationUrl: string;
  sourceUrl: string;
  isVerified: boolean;
  isExpired: boolean;
  isDemo?: boolean;
  lastVerifiedDate: string;
  verifiedBy: string;
  featured?: boolean;
  notes?: string;
  targetFields?: string[];
}

export interface EligibilityCriterionResult {
  title: string;
  criterionType: 'academic' | 'nationality' | 'age' | 'language' | 'passport' | 'degree_match';
  matched: boolean | null; // null if information missing
  message: string;
  details?: string;
}

export interface EligibilityEvaluation {
  scholarshipId: string;
  scholarshipName: string;
  status: EligibilityStatus;
  overallScore: number; // 0 to 100 confidence
  summary: string;
  matchedCriteria: EligibilityCriterionResult[];
  unmetCriteria: EligibilityCriterionResult[];
  missingCriteria: EligibilityCriterionResult[];
  recommendedNextSteps: string[];
  disclaimer: string;
}

export interface SavedScholarship {
  id: string;
  scholarshipId: string;
  scholarshipName: string;
  country: string;
  fundingCoverage: FundingType;
  savedAt: string;
  deadline: string;
  status: ApplicationStatus;
  notes?: string;
  reminderSet: boolean;
}

export interface DocumentItem {
  id: string;
  documentType: DocumentType;
  title: string;
  description: string;
  status: DocumentStatus;
  notes?: string;
  fileName?: string;
  fileSize?: string;
  attestationRequired?: boolean;
  updatedAt: string;
}

export interface ApplicationDraft {
  id: string;
  type: DraftType;
  scholarshipId?: string;
  scholarshipName?: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}
