import { StudentProfile, Scholarship, DraftType, ApplicationDraft } from '../types/scholarship';

export interface GenerateDraftRequest {
  type: DraftType;
  studentProfile: StudentProfile;
  scholarship?: Scholarship;
  customPrompt?: string;
}

export async function generateApplicationDraft(req: GenerateDraftRequest): Promise<ApplicationDraft> {
  try {
    const res = await fetch('/api/gemini/generate-draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });

    if (!res.ok) {
      throw new Error(`Draft generation failed with HTTP ${res.status}`);
    }

    const data = await res.json();
    return {
      id: 'draft-' + Date.now(),
      type: req.type,
      scholarshipId: req.scholarship?.id,
      scholarshipName: req.scholarship?.name,
      title: data.title || `${req.type.replace(/_/g, ' ').toUpperCase()} Draft`,
      content: data.content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.warn('API error during draft generation, creating in-client structured draft:', err);
    return generateLocalDraft(req);
  }
}

function generateLocalDraft(req: GenerateDraftRequest): ApplicationDraft {
  const { type, studentProfile, scholarship } = req;
  const name = studentProfile.fullName || 'Applicant';
  const degree = studentProfile.desiredDegree || 'Degree Program';
  const scholName = scholarship ? scholarship.name : 'the prestigious scholarship program';
  const provider = scholarship ? scholarship.provider : 'the Scholarship Selection Committee';
  const intermediatePct = studentProfile.intermediate?.percentage || 84;

  let title = '';
  let content = '';

  switch (type) {
    case 'motivation_letter':
      title = `Letter of Motivation — ${scholName}`;
      content = `To: The Selection Committee
Program: ${scholName}
Provider: ${provider}

Dear Members of the Scholarship Selection Committee,

I am writing with profound enthusiasm to submit my application for ${scholName} in pursuit of ${degree}. As an ambitious student from ${studentProfile.nationality || 'Pakistan'} with an academic record of ${intermediatePct}% in higher secondary education, I have dedicated myself to mastering both theoretical principles and applied technological systems.

Throughout my studies at ${studentProfile.currentUniversity || 'my institution'}, I spearheaded key academic initiatives, including: ${studentProfile.achievementsAndProjects || 'rigorous research projects and engineering problem-solving'}. In parallel, my extracurricular engagement in ${studentProfile.extracurriculars || 'student academic societies'} taught me how to collaborate effectively across multidisciplinary teams.

${scholarship ? `The academic distinction of institutions in ${scholarship.country} offers an unparalleled ecosystem for deep research, innovative mentorship, and high-impact international exchange.` : 'An international learning environment will equip me with the technical rigor and global perspective required to excel.'}

Upon successfully concluding my degree, my objective is to return and deploy this expertise within Pakistan's rapidly expanding digital and engineering sectors. This scholarship represents a transformative catalyst for my academic trajectory, and I am fully prepared to meet its highest standards.

Thank you very much for considering my application.

Sincerely,
${name}
Contact: ${studentProfile.email || '[Your Email]'}
Nationality: ${studentProfile.nationality || 'Pakistan'}`;
      break;

    case 'statement_of_purpose':
      title = `Statement of Purpose (SOP) — ${scholName}`;
      content = `STATEMENT OF PURPOSE: ${degree.toUpperCase()}
Candidate: ${name} (${studentProfile.nationality || 'Pakistani National'})
Target Program: ${scholName}

1. ACADEMIC GENESIS & FOUNDATION
My academic pursuits have centered on engineering principled, scalable computational solutions. Scoring ${intermediatePct}% in my Intermediate board examinations cemented my work ethic and analytical mindset. At ${studentProfile.currentUniversity || 'university'}, I translated fundamental concepts into functional prototypes, focusing particularly on ${studentProfile.desiredDegree || 'modern technological frontiers'}.

2. RESEARCH & PROJECT HIGHLIGHTS
My core technical engagement includes:
- Primary Project: ${studentProfile.achievementsAndProjects || 'End-to-end development of data-driven systems with demonstrable real-world utility.'}
- Technical Toolkit: Proficient in contemporary frameworks, algorithmic modeling, and empirical research evaluation.
- Extracurricular Leadership: ${studentProfile.extracurriculars || 'Coordinated technical workshops and fostered collaborative problem-solving among peer groups.'}

3. WHY THIS SCHOLARSHIP AND HOST INSTITUTION
The ${scholName} is uniquely structured to cultivate visionary leaders. The curriculum's balance between theoretical depth and practical laboratory research directly addresses the challenges I aspire to solve.

4. LONG-TERM CAREER TRAJECTORY & IMPACT
My five-year post-graduation roadmap entails spearheading impactful technical implementations in emerging markets. Armed with advanced methodologies acquired through this award, I will bridge the gap between cutting-edge innovation and sustainable community development in Pakistan.`;
      break;

    case 'scholarship_email':
      title = `Scholarship Inquiry & Professor Contact — ${scholName}`;
      content = `Subject: Prospective Scholarship Applicant Inquiry: ${degree} — ${name}

Dear Admissions & Scholarship Committee,

I hope this email finds you well.

My name is ${name}, an applicant from ${studentProfile.nationality || 'Pakistan'} preparing an application for ${scholName} to pursue ${degree}. 

Having thoroughly reviewed the published guidelines on your official portal, I am writing to politely clarify two specific procedural aspects:
1. Verification regarding the submission of the English as Medium of Instruction (MOI) Certificate issued by my university registrar.
2. The recommended format for certified translations of educational credentials (BISE & HEC attested).

For your reference, I hold an academic record of ${intermediatePct}% and have completed relevant project work in: ${studentProfile.achievementsAndProjects || 'applied engineering and computer science'}.

I have attached my updated academic CV for your preliminary review. Thank you very much for your time, consideration, and guidance.

Warm regards,

${name}
${studentProfile.currentUniversity || 'University Graduate'}
Email: ${studentProfile.email || '[Email]'}
Application ID / Reference: [If applicable]`;
      break;

    case 'recommendation_request':
      title = `Recommendation Letter Request Draft — ${scholName}`;
      content = `Dear Professor [Insert Professor's Name],

I hope you are having an excellent semester.

I am writing to respectfully ask if you would feel comfortable providing a confidential academic letter of recommendation for my upcoming application to ${scholName} for a ${degree}.

Having had the privilege of taking your course [Insert Course Name, e.g., CS301 - Algorithms], where I earned a grade of [Insert Grade], and having worked on [Insert Project Topic, e.g., Machine Learning Classification System], your insights into my academic dedication, research rigor, and problem-solving capability would be invaluable to the selection committee.

Key milestones of my profile for your reference:
- Academic Marks: ${intermediatePct}% (Intermediate) / [Current CGPA]
- Key Project Completed: ${studentProfile.achievementsAndProjects || '[Insert Specific Project Milestone]'}
- Application Deadline: ${scholarship?.applicationClosingDate || '[Insert Deadline Date]'}

The submission process is completed via an online portal link that will be sent directly to your institutional email. I have attached my latest CV, transcript, and draft Statement of Purpose to assist you.

Thank you very much for your continued guidance and support throughout my academic journey.

With highest regards,

${name}
Student ID: [Your Student ID]
${studentProfile.currentUniversity || 'FAST-NUCES Islamabad'}`;
      break;

    default:
      title = `Application Draft — ${name}`;
      content = `# SCHOLARSHIP APPLICATION ESSAY DRAFT
Candidate: ${name}
Target: ${scholName}

${studentProfile.achievementsAndProjects || 'Detailed academic and practical project descriptions highlighting applicant readiness and qualification for the scholarship.'}`;
  }

  return {
    id: 'draft-' + Date.now(),
    type,
    scholarshipId: scholarship?.id,
    scholarshipName: scholarship?.name,
    title,
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
