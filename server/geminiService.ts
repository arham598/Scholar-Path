import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

// Ensure User-Agent is set as required by skill
export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export async function evaluateEligibilityWithGemini(studentProfile: any, scholarship: any) {
  const ai = getGeminiClient();
  
  // High quality prompt enforcing zero fabrication and realistic assessment
  const prompt = `
You are an expert scholarship advisor evaluating a student's profile for the following scholarship based strictly on its published criteria.

STUDENT PROFILE:
- Name: ${studentProfile.fullName || 'Student'}
- Nationality: ${studentProfile.nationality || 'Unspecified'}
- Country of Residence: ${studentProfile.countryOfResidence || 'Unspecified'}
- Date of Birth / Age: ${studentProfile.dateOfBirth || 'Unspecified'}
- Current Education Level: ${studentProfile.currentEducationLevel || 'Unspecified'}
- Matric Marks: ${studentProfile.matric?.marks || 'N/A'} / ${studentProfile.matric?.totalMarks || 'N/A'} (${studentProfile.matric?.percentage ?? 'N/A'}%)
- Intermediate Marks: ${studentProfile.intermediate?.marks || 'N/A'} / ${studentProfile.intermediate?.totalMarks || 'N/A'} (${studentProfile.intermediate?.percentage ?? 'N/A'}%)
- Current University & Degree: ${studentProfile.currentUniversity || 'N/A'}, ${studentProfile.currentDegree || 'N/A'}
- Desired Degree: ${studentProfile.desiredDegree || 'Unspecified'}
- Preferred Countries: ${(studentProfile.preferredCountries || []).join(', ') || 'Any'}
- Passport Status: ${studentProfile.passportStatus || 'Unspecified'}
- English Proficiency: Test: ${studentProfile.englishProficiency?.testType || 'None'}, Score: ${studentProfile.englishProficiency?.score || 'None'}, Certificate: ${studentProfile.englishProficiency?.hasCertificate ? 'Yes' : 'No'}
- Extracurriculars: ${studentProfile.extracurriculars || 'None stated'}
- Projects & Achievements: ${studentProfile.achievementsAndProjects || 'None stated'}
- Funding Requirement: ${studentProfile.fundingRequirement || 'Unspecified'}

SCHOLARSHIP PUBLISHED CRITERIA:
- Name: ${scholarship.name}
- Provider: ${scholarship.provider} (${scholarship.country})
- Degree Levels: ${(scholarship.degreeLevels || []).join(', ')}
- Eligible Nationalities: ${(scholarship.eligibleNationalities || []).join(', ')}
- Minimum Academic Percentage: ${scholarship.minPercentage ? scholarship.minPercentage + '%' : 'Not specified'}
- Academic Requirements: ${scholarship.academicRequirements}
- Age Restrictions: ${scholarship.ageRestrictions || 'None'}
- Max Age: ${scholarship.maxAge || 'None'}
- Language Requirements: ${JSON.stringify(scholarship.languageRequirements)}
- Funding: ${scholarship.fundingCoverage} (${scholarship.fundingDetails})
- Application Deadline: ${scholarship.applicationClosingDate}
- Required Documents: ${(scholarship.requiredDocuments || []).join('; ')}

RULES FOR EVALUATION:
1. Compare student's actual grades, nationality, language test, passport, and education level against criteria.
2. Determine status:
   - "eligible": Meets all mandatory criteria (nationality, min academic marks, degree level).
   - "potentially_eligible": Close to meeting or missing non-blocking item (e.g. Needs to take IELTS or get English Medium Certificate, passport in process).
   - "not_eligible": Violates hard disqualifier (e.g. wrong nationality, marks significantly below hard cutoff, age limit exceeded).
   - "missing_info": Essential profile data (e.g. intermediate marks or nationality) is absent.
3. Never promise or guarantee admission or scholarship award.
4. Show specific matches and specific missing or unmet requirements in simple language.

Respond ONLY with valid JSON with this exact structure:
{
  "status": "eligible" | "potentially_eligible" | "not_eligible" | "missing_info",
  "overallScore": number (0 to 100),
  "summary": string (2-3 clear sentences summarizing the verdict),
  "matchedCriteria": [
    { "title": string, "criterionType": "academic"|"nationality"|"age"|"language"|"passport"|"degree_match", "matched": true, "message": string, "details": string }
  ],
  "unmetCriteria": [
    { "title": string, "criterionType": "academic"|"nationality"|"age"|"language"|"passport"|"degree_match", "matched": false, "message": string, "details": string }
  ],
  "missingCriteria": [
    { "title": string, "criterionType": "academic"|"nationality"|"age"|"language"|"passport"|"degree_match", "matched": null, "message": string, "details": string }
  ],
  "recommendedNextSteps": [
    string (specific actionable step for this student to qualify or apply)
  ],
  "disclaimer": "ScholarPath evaluates eligibility based solely on published criteria. Admission, shortlisting, and scholarship awards are decided exclusively by the scholarship selection committee."
}
`;

  if (!ai) {
    // Graceful offline heuristic fallback
    return generateDeterministicEvaluation(studentProfile, scholarship);
  }

  try {
    const apiCall = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API timeout')), 9000)
    );

    const response: any = await Promise.race([apiCall, timeout]);

    const text = response.text || '';
    const parsed = JSON.parse(text);
    return {
      scholarshipId: scholarship.id,
      scholarshipName: scholarship.name,
      ...parsed,
    };
  } catch (error: any) {
    console.warn('Gemini API call notice, using deterministic evaluation:', error.message || error);
    return generateDeterministicEvaluation(studentProfile, scholarship);
  }
}

export async function generateApplicationDraftWithGemini(params: {
  type: string;
  studentProfile: any;
  scholarship?: any;
  customPrompt?: string;
}) {
  const ai = getGeminiClient();
  const { type, studentProfile, scholarship, customPrompt } = params;

  const typeLabels: Record<string, string> = {
    motivation_letter: 'Motivation Letter',
    statement_of_purpose: 'Statement of Purpose (SOP)',
    cv: 'Scholarship Academic CV & Profile Summary',
    scholarship_email: 'Scholarship Inquiry & Professor Contact Email',
    recommendation_request: 'Letter of Recommendation Request Draft (for Professor/Teacher)',
    personal_statement: 'Personal Statement',
    custom_answer: 'Scholarship Essay Answer',
  };

  const documentTypeLabel = typeLabels[type] || 'Application Document';

  const systemPrompt = `
You are an elite academic scholarship writing consultant for international and Pakistani students.
Your task is to draft an authentic, polished, compelling ${documentTypeLabel}.

CRITICAL ANTI-FABRICATION INSTRUCTIONS:
- Ground everything in the student's real background, actual percentages, declared interests, and real projects.
- NEVER invent false internships, fake publications, fake awards, or hallucinated research.
- If certain specific details are missing, use clear bracketed placeholders like "[Mention your specific final year project topic here]" so the student can customize it.
- Never state that the student is guaranteed the scholarship.
- Use professional, persuasive academic English (active voice, clear structure, compelling narrative).
`;

  const userPrompt = `
STUDENT PROFILE:
- Full Name: ${studentProfile.fullName || 'Applicant'}
- Nationality: ${studentProfile.nationality || 'Pakistani'}
- Education Level: ${studentProfile.currentEducationLevel || 'Undergraduate'}
- Matriculation Record: ${studentProfile.matric?.marks || ''}/${studentProfile.matric?.totalMarks || ''} (${studentProfile.matric?.percentage ?? ''}%)
- Intermediate Record: ${studentProfile.intermediate?.marks || ''}/${studentProfile.intermediate?.totalMarks || ''} (${studentProfile.intermediate?.percentage ?? ''}%)
- Current University & Degree: ${studentProfile.currentUniversity || 'N/A'}, ${studentProfile.currentDegree || 'N/A'}
- Desired Program/Degree: ${studentProfile.desiredDegree || 'Computer Science / Engineering'}
- Extracurriculars: ${studentProfile.extracurriculars || 'Academic projects and extracurricular participation'}
- Achievements & Projects: ${studentProfile.achievementsAndProjects || 'Coursework projects'}
- English Proficiency: ${studentProfile.englishProficiency?.testType || 'English Medium'} (Score: ${studentProfile.englishProficiency?.score || 'N/A'})

TARGET SCHOLARSHIP:
${scholarship ? `
- Scholarship: ${scholarship.name}
- Provider: ${scholarship.provider}
- Country: ${scholarship.country}
- Target Fields: ${(scholarship.targetFields || []).join(', ')}
- Funding: ${scholarship.fundingCoverage}
` : 'General scholarship application'}

ADDITIONAL USER INSTRUCTIONS:
${customPrompt || 'Create a comprehensive, standout draft tailored to the criteria.'}

Please write the complete, ready-to-refine document now.
Include a recommended title/subject line and formatted paragraphs.
`;

  if (!ai) {
    return generateFallbackDraft(type, studentProfile, scholarship);
  }

  try {
    const apiCall = ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    // 9 second timeout protection
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API timeout')), 9000)
    );

    const response: any = await Promise.race([apiCall, timeout]);

    return {
      title: `${documentTypeLabel} — ${scholarship ? scholarship.name : 'General Draft'}`,
      content: response.text || generateFallbackDraft(type, studentProfile, scholarship).content,
      type,
      scholarshipId: scholarship?.id,
      scholarshipName: scholarship?.name,
    };
  } catch (err: any) {
    console.warn('Gemini draft notice, using high-quality structured template:', err.message || err);
    return generateFallbackDraft(type, studentProfile, scholarship);
  }
}

// Deterministic rule-based evaluation engine
export function generateDeterministicEvaluation(profile: any, scholarship: any) {
  const matchedCriteria: any[] = [];
  const unmetCriteria: any[] = [];
  const missingCriteria: any[] = [];

  // 1. Nationality check
  const nat = (profile.nationality || '').toLowerCase().trim();
  const eligibleNats = (scholarship.eligibleNationalities || []).map((n: string) => n.toLowerCase());
  const isAllAllowed = eligibleNats.some((n: string) => n.includes('all') || n.includes('non-') || n.includes('partner') || n.includes('developing'));
  const isPakistanAllowed = eligibleNats.some((n: string) => n.includes('pakistan') || n.includes('ajk'));

  if (!nat) {
    missingCriteria.push({
      title: 'Nationality Verification',
      criterionType: 'nationality',
      matched: null,
      message: 'Nationality not provided in profile.',
      details: `Scholarship requires eligible nationalities: ${scholarship.eligibleNationalities.join(', ')}.`
    });
  } else if (isAllAllowed || (isPakistanAllowed && nat.includes('pakistan')) || eligibleNats.includes(nat)) {
    matchedCriteria.push({
      title: 'Nationality Eligibility',
      criterionType: 'nationality',
      matched: true,
      message: `Your nationality (${profile.nationality}) is eligible.`,
      details: `Official criteria includes: ${scholarship.eligibleNationalities.join(', ')}.`
    });
  } else {
    unmetCriteria.push({
      title: 'Nationality Eligibility',
      criterionType: 'nationality',
      matched: false,
      message: `Your nationality (${profile.nationality}) does not match the listed countries.`,
      details: `Restricted to: ${scholarship.eligibleNationalities.join(', ')}.`
    });
  }

  // 2. Academic record check (Intermediate / Matric / Degree)
  const studentPct = Number(profile.intermediate?.percentage || profile.matric?.percentage || 0);
  const minPct = Number(scholarship.minPercentage || 60);

  if (!studentPct) {
    missingCriteria.push({
      title: 'Academic Marks / Percentage',
      criterionType: 'academic',
      matched: null,
      message: 'Intermediate or Matric percentage is missing in your profile.',
      details: `Scholarship requires minimum ${minPct}% marks.`
    });
  } else if (studentPct >= minPct) {
    matchedCriteria.push({
      title: 'Academic Performance',
      criterionType: 'academic',
      matched: true,
      message: `Your academic percentage (${studentPct}%) meets the minimum threshold (${minPct}%).`,
      details: scholarship.academicRequirements
    });
  } else {
    unmetCriteria.push({
      title: 'Academic Performance',
      criterionType: 'academic',
      matched: false,
      message: `Your percentage (${studentPct}%) is below the published minimum of ${minPct}%.`,
      details: `Published requirement: ${scholarship.academicRequirements}`
    });
  }

  // 3. Age limit check
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
        title: 'Age Eligibility',
        criterionType: 'age',
        matched: null,
        message: 'Date of birth not specified.',
        details: `Scholarship has maximum age limit of ${scholarship.maxAge} years.`
      });
    } else if (age <= scholarship.maxAge) {
      matchedCriteria.push({
        title: 'Age Requirement',
        criterionType: 'age',
        matched: true,
        message: `Your age (~${age} years) is within the maximum limit of ${scholarship.maxAge} years.`,
        details: scholarship.ageRestrictions || 'Age verified.'
      });
    } else {
      unmetCriteria.push({
        title: 'Age Requirement',
        criterionType: 'age',
        matched: false,
        message: `Your age (~${age} years) exceeds the maximum limit of ${scholarship.maxAge} years.`,
        details: scholarship.ageRestrictions || 'Exceeds age cutoff.'
      });
    }
  }

  // 4. Language Requirement check
  const eng = profile.englishProficiency;
  if (!eng || eng.testType === 'none') {
    if (scholarship.languageRequirements?.englishMediumWaiver) {
      matchedCriteria.push({
        title: 'Language Requirement (Waiver / MOI)',
        criterionType: 'language',
        matched: true,
        message: 'English Medium of Instruction certificate accepted or language course included.',
        details: scholarship.languageRequirements.description
      });
    } else {
      missingCriteria.push({
        title: 'Formal English Test Score',
        criterionType: 'language',
        matched: null,
        message: 'Formal English test score (IELTS/TOEFL) not yet recorded in profile.',
        details: scholarship.languageRequirements?.description || 'Test required.'
      });
    }
  } else {
    matchedCriteria.push({
      title: 'Language Proficiency',
      criterionType: 'language',
      matched: true,
      message: `Recorded ${eng.testType.toUpperCase()} proficiency ${eng.score ? `(${eng.score})` : ''}.`,
      details: scholarship.languageRequirements?.description || 'Requirement satisfied.'
    });
  }

  // 5. Passport status check
  if (scholarship.country !== 'Pakistan') {
    if (profile.passportStatus === 'have_valid_passport') {
      matchedCriteria.push({
        title: 'International Travel Document',
        criterionType: 'passport',
        matched: true,
        message: 'Valid passport ready for international visa and application process.',
        details: 'Passport validity should extend at least 6 months past arrival.'
      });
    } else if (profile.passportStatus === 'in_process') {
      missingCriteria.push({
        title: 'Passport Processing',
        criterionType: 'passport',
        matched: null,
        message: 'Passport is currently in process. Needed before final visa and travel.',
        details: 'Apply under normal or urgent token at NADRA / Passport office.'
      });
    } else {
      missingCriteria.push({
        title: 'Passport Required',
        criterionType: 'passport',
        matched: null,
        message: 'International travel requires a valid machine-readable passport.',
        details: 'Obtain passport prior to scholarship closing date.'
      });
    }
  }

  // Overall status evaluation
  let status: 'eligible' | 'potentially_eligible' | 'not_eligible' | 'missing_info' = 'eligible';
  let overallScore = 85;

  if (unmetCriteria.length > 0) {
    status = 'not_eligible';
    overallScore = 30;
  } else if (missingCriteria.length > 1) {
    status = 'missing_info';
    overallScore = 55;
  } else if (missingCriteria.length === 1) {
    status = 'potentially_eligible';
    overallScore = 75;
  }

  const steps: string[] = [];
  if (unmetCriteria.length > 0) {
    steps.push('Review alternative scholarships where your current percentage or age fits published parameters.');
  }
  if (missingCriteria.some(m => m.criterionType === 'passport')) {
    steps.push('Schedule an urgent passport application at your nearest passport office.');
  }
  if (missingCriteria.some(m => m.criterionType === 'language')) {
    steps.push('Request an English Medium of Instruction letter from your college/university registrar.');
  }
  steps.push(`Review the official application portal: ${scholarship.officialApplicationUrl}`);
  steps.push('Generate a tailored Motivation Letter using the ScholarPath AI Application Assistant.');

  return {
    scholarshipId: scholarship.id,
    scholarshipName: scholarship.name,
    status,
    overallScore,
    summary: status === 'eligible'
      ? `You meet the primary published academic and eligibility criteria for ${scholarship.name}. Review required documents and prepare your application before ${scholarship.applicationClosingDate}.`
      : status === 'potentially_eligible'
      ? `You are potentially eligible for ${scholarship.name}. You satisfy key academic marks, but have 1 pending requirement or document to complete.`
      : status === 'missing_info'
      ? `Additional profile information is required to verify your eligibility for ${scholarship.name}. Update your academic marks and language status.`
      : `Based on published parameters, you do not meet one or more hard requirements (such as minimum marks, age limit, or nationality restriction) for this specific scheme.`,
    matchedCriteria,
    unmetCriteria,
    missingCriteria,
    recommendedNextSteps: steps,
    disclaimer: 'ScholarPath provides objective eligibility evaluation based strictly on published scholarship announcements. Admission, shortlisting, and final awards are decided solely by the official scholarship committees.'
  };
}

function generateFallbackDraft(type: string, student: any, scholarship?: any) {
  const name = student.fullName || 'Applicant';
  const degree = student.desiredDegree || 'Master in Computer Science';
  const scholName = scholarship ? scholarship.name : 'the scholarship program';
  const provider = scholarship ? scholarship.provider : 'the Scholarship Selection Committee';

  if (type === 'motivation_letter' || type === 'statement_of_purpose') {
    return {
      title: `Letter of Motivation — ${scholName}`,
      content: `Dear Members of the Selection Committee at ${provider},

I am writing to express my earnest enthusiasm for applying to ${scholName} to pursue my ${degree}. As a dedicated student from Pakistan with a strong academic foundation (achieving ${student.intermediate?.percentage || 80}% in Intermediate examinations), I have continually striven for technical excellence and purposeful innovation.

During my academic journey, I immersed myself in practical projects, including ${student.achievementsAndProjects || 'rigorous coursework and software development challenges'}. These experiences honed not only my problem-solving acumen but also my dedication to applying computational methods toward solving real-world challenges in emerging economies.

${scholarship ? `The reputation of ${scholarship.country}'s institutions for rigorous academic inquiry and cutting-edge research makes this opportunity uniquely aligned with my academic objectives.` : 'Studying at an international center of excellence will empower me to gain world-class perspectives.'}

Upon completion of my studies, I intend to return to Pakistan and contribute directly to technological empowerment, fostering collaborative initiatives and knowledge transfer. I am prepared to meet the high academic demands of this prestigious award and respectfully request your favorable consideration of my application.

Sincerely,
${name}
Email: ${student.email || '[Your Email]'}`,
      type,
      scholarshipId: scholarship?.id,
      scholarshipName: scholarship?.name,
    };
  }

  if (type === 'scholarship_email') {
    return {
      title: `Inquiry Regarding ${scholName} — ${name}`,
      content: `Subject: Prospective Scholarship Applicant Inquiry: ${degree} — ${name}

Dear Admissions & Scholarship Coordinator,

I hope this message finds you well.

My name is ${name}, a graduate from Pakistan holding a strong background in ${student.currentDegree || 'Computer Science'} (Academic average: ${student.intermediate?.percentage || student.matric?.percentage || '80%'}). I am actively preparing my application for ${scholName}.

Having reviewed the published guidelines, I am eager to confirm details regarding:
1. Verification of English Medium of Instruction acceptance for candidates from Pakistani universities.
2. The submission procedure for authenticated academic transcripts.

I have attached my academic CV and summary of research projects for your preliminary review. Thank you very much for your time and guidance.

Warm regards,

${name}
${student.currentUniversity || 'University Graduate'}
Contact: ${student.email || '[Email]'}`,
      type,
      scholarshipId: scholarship?.id,
      scholarshipName: scholarship?.name,
    };
  }

  if (type === 'recommendation_request') {
    return {
      title: `Request for Recommendation Letter — ${scholName}`,
      content: `Dear Professor [Professor's Last Name],

I hope you are having a productive semester.

I am writing to respectfully request your support with an academic letter of recommendation for my application to ${scholName} for a ${degree}.

Having had the privilege of attending your course [Insert Course Name, e.g., Data Structures / Algorithms] where I received a grade of [Insert Grade, e.g., A/4.0], and having worked under your guidance on [Insert Project / Topic], I believe your perspective would provide the selection committee with meaningful insight into my analytical capabilities, discipline, and research potential.

Key highlights of my scholarship application profile:
- Intermediate / Academic Standing: ${student.intermediate?.percentage || 80}%
- Relevant Projects: ${student.achievementsAndProjects || '[Insert Specific Project Milestone]'}
- Application Deadline: ${scholarship?.applicationClosingDate || '[Insert Date]'}

I have prepared an updated CV and my draft Statement of Purpose for your convenience. Please let me know if you would be able to recommend me, or if we could arrange a brief meeting.

Thank you very much for your mentorship and continued support.

Respectfully,
${name}
${student.currentUniversity || '[Your University]'}`,
      type,
      scholarshipId: scholarship?.id,
      scholarshipName: scholarship?.name,
    };
  }

  // Default CV / Summary
  return {
    title: `Scholarship Profile & Academic Summary — ${name}`,
    content: `# ACADEMIC CV PROFILE SUMMARY: ${name.toUpperCase()}
Email: ${student.email || '[Email]'} | Nationality: ${student.nationality || 'Pakistani'} | Target: ${degree}

## EXECUTIVE SUMMARY
High-achieving academic candidate with ${student.intermediate?.percentage || 80}% academic performance. Demonstrates disciplined technical expertise, project execution skills, and a committed vision to leverage technology for social and industrial development.

## EDUCATION
- Matriculation / Secondary Education: ${student.matric?.marks || 'N/A'}/${student.matric?.totalMarks || 'N/A'} (${student.matric?.percentage ?? 0}%)
- Intermediate / Higher Secondary Education: ${student.intermediate?.marks || 'N/A'}/${student.intermediate?.totalMarks || 'N/A'} (${student.intermediate?.percentage ?? 0}%)
- Current / Completed Degree: ${student.currentDegree || 'BS in relevant field'}, ${student.currentUniversity || 'University'}

## NOTABLE PROJECTS & ACHIEVEMENTS
- ${student.achievementsAndProjects || 'Academic capstone project applying modern software frameworks to optimize system performance.'}
- Participated in extracurricular initiatives: ${student.extracurriculars || 'Active member of student academic society.'}

## LANGUAGE PROFICIENCY
- ${student.englishProficiency?.testType?.toUpperCase() || 'ENGLISH MEDIUM'}: ${student.englishProficiency?.score || 'Proficiency certified by university instruction'}.`,
    type,
    scholarshipId: scholarship?.id,
    scholarshipName: scholarship?.name,
  };
}
