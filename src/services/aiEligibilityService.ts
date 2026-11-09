import { StudentProfile, Scholarship, EligibilityEvaluation } from '../types/scholarship';

export async function checkEligibility(
  studentProfile: StudentProfile,
  scholarship: Scholarship
): Promise<EligibilityEvaluation> {
  try {
    const res = await fetch('/api/gemini/evaluate-eligibility', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentProfile, scholarship }),
    });

    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('API route failed, using in-browser evaluation fallback:', err);
    // Use fallback evaluation
    return fallbackEvaluate(studentProfile, scholarship);
  }
}

function fallbackEvaluate(profile: StudentProfile, scholarship: Scholarship): EligibilityEvaluation {
  const matchedCriteria: any[] = [];
  const unmetCriteria: any[] = [];
  const missingCriteria: any[] = [];

  // Nationality
  const studentNat = (profile.nationality || '').toLowerCase().trim();
  const eligibleNats = (scholarship.eligibleNationalities || []).map((n) => n.toLowerCase());
  const isAllAllowed = eligibleNats.some((n) => n.includes('all') || n.includes('non-') || n.includes('partner') || n.includes('developing'));
  const isPakistanAllowed = eligibleNats.some((n) => n.includes('pakistan') || n.includes('ajk'));

  if (!studentNat) {
    missingCriteria.push({
      title: 'Nationality Verification',
      criterionType: 'nationality',
      matched: null,
      message: 'Nationality not provided in student profile.',
      details: `Eligible: ${scholarship.eligibleNationalities.join(', ')}`
    });
  } else if (isAllAllowed || (isPakistanAllowed && studentNat.includes('pakistan')) || eligibleNats.includes(studentNat)) {
    matchedCriteria.push({
      title: 'Eligible Nationality',
      criterionType: 'nationality',
      matched: true,
      message: `Your nationality (${profile.nationality}) is eligible.`,
      details: `Accepted nationalities: ${scholarship.eligibleNationalities.join(', ')}`
    });
  } else {
    unmetCriteria.push({
      title: 'Nationality Restriction',
      criterionType: 'nationality',
      matched: false,
      message: `Your nationality (${profile.nationality}) is not listed.`,
      details: `Restricted to: ${scholarship.eligibleNationalities.join(', ')}`
    });
  }

  // Academic marks
  const studentPct = Number(profile.intermediate?.percentage || profile.matric?.percentage || 0);
  const minPct = Number(scholarship.minPercentage || 60);

  if (!studentPct) {
    missingCriteria.push({
      title: 'Academic Performance Criteria',
      criterionType: 'academic',
      matched: null,
      message: 'Marks/percentage is missing in profile.',
      details: `Requires minimum ${minPct}% marks.`
    });
  } else if (studentPct >= minPct) {
    matchedCriteria.push({
      title: 'Academic Threshold Met',
      criterionType: 'academic',
      matched: true,
      message: `Your percentage (${studentPct}%) meets or exceeds the published minimum (${minPct}%).`,
      details: scholarship.academicRequirements
    });
  } else {
    unmetCriteria.push({
      title: 'Academic Minimum Unmet',
      criterionType: 'academic',
      matched: false,
      message: `Your percentage (${studentPct}%) is below the published requirement of ${minPct}%.`,
      details: scholarship.academicRequirements
    });
  }

  // Age
  if (scholarship.maxAge) {
    let age: number | null = null;
    if (profile.dateOfBirth) {
      const birthYear = new Date(profile.dateOfBirth).getFullYear();
      if (!isNaN(birthYear)) {
        age = new Date().getFullYear() - birthYear;
      }
    }
    if (age === null) {
      missingCriteria.push({
        title: 'Age Limit Check',
        criterionType: 'age',
        matched: null,
        message: 'Birth date not set in profile.',
        details: `Maximum age limit: ${scholarship.maxAge} years.`
      });
    } else if (age <= scholarship.maxAge) {
      matchedCriteria.push({
        title: 'Age Eligibility',
        criterionType: 'age',
        matched: true,
        message: `Your age (~${age} years) is within the maximum limit (${scholarship.maxAge} years).`,
        details: scholarship.ageRestrictions || 'Age verified'
      });
    } else {
      unmetCriteria.push({
        title: 'Age Limit Exceeded',
        criterionType: 'age',
        matched: false,
        message: `Your age (~${age} years) exceeds the maximum limit of ${scholarship.maxAge} years.`,
        details: scholarship.ageRestrictions || 'Exceeds age threshold'
      });
    }
  }

  // Language
  const eng = profile.englishProficiency;
  if (!eng || eng.testType === 'none') {
    if (scholarship.languageRequirements?.englishMediumWaiver) {
      matchedCriteria.push({
        title: 'Language Requirement',
        criterionType: 'language',
        matched: true,
        message: 'English Medium of Instruction certificate accepted or language course included.',
        details: scholarship.languageRequirements.description
      });
    } else {
      missingCriteria.push({
        title: 'Formal English Language Certificate',
        criterionType: 'language',
        matched: null,
        message: 'Formal English test score (IELTS/TOEFL) not yet entered in profile.',
        details: scholarship.languageRequirements?.description || 'Test required'
      });
    }
  } else {
    matchedCriteria.push({
      title: 'Language Test',
      criterionType: 'language',
      matched: true,
      message: `Recorded ${eng.testType.toUpperCase()} proficiency ${eng.score ? `(${eng.score})` : ''}.`,
      details: scholarship.languageRequirements?.description || 'Requirement met'
    });
  }

  // Status
  let status: 'eligible' | 'potentially_eligible' | 'not_eligible' | 'missing_info' = 'eligible';
  let overallScore = 85;

  if (unmetCriteria.length > 0) {
    status = 'not_eligible';
    overallScore = 35;
  } else if (missingCriteria.length > 1) {
    status = 'missing_info';
    overallScore = 55;
  } else if (missingCriteria.length === 1) {
    status = 'potentially_eligible';
    overallScore = 78;
  }

  return {
    scholarshipId: scholarship.id,
    scholarshipName: scholarship.name,
    status,
    overallScore,
    summary: status === 'eligible'
      ? `You meet all primary published eligibility criteria for ${scholarship.name}. Your academic score (${studentPct}%) satisfies the ${minPct}% threshold.`
      : status === 'potentially_eligible'
      ? `You are potentially eligible for ${scholarship.name}. Review the pending criteria and prepare documentation before the deadline (${scholarship.applicationClosingDate}).`
      : status === 'missing_info'
      ? `Some information is missing from your profile to confirm eligibility for ${scholarship.name}. Complete your profile details.`
      : `Based on published requirements, you do not meet one or more hard requirements for ${scholarship.name}.`,
    matchedCriteria,
    unmetCriteria,
    missingCriteria,
    recommendedNextSteps: [
      `Review official application guidelines: ${scholarship.officialApplicationUrl}`,
      'Check the Document Manager to prepare required certificates and attestations.',
      'Use the AI Application Assistant to generate a tailored Statement of Purpose.'
    ],
    disclaimer: 'ScholarPath evaluates eligibility based solely on published criteria. Admission, shortlisting, and awards are decided exclusively by the respective scholarship provider.'
  };
}
