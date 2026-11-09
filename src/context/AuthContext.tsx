import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';
import { StudentProfile } from '../types/scholarship';

interface AuthContextType {
  user: User | { uid: string; email: string | null; displayName: string | null; isDemo?: boolean } | null;
  profile: StudentProfile;
  isAdmin: boolean;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInAsDemoStudent: () => void;
  signInAsDemoAdmin: () => void;
  signOutUser: () => Promise<void>;
  updateStudentProfile: (updated: Partial<StudentProfile>) => Promise<void>;
  deleteStudentProfile: () => Promise<void>;
  exportProfileData: () => void;
}

const DEFAULT_PROFILE: StudentProfile = {
  fullName: 'Muhammad Daniyal',
  email: 'daniyal.student@example.pk',
  nationality: 'Pakistan',
  countryOfResidence: 'Pakistan',
  dateOfBirth: '2003-05-14',
  currentEducationLevel: 'Bachelor (Ongoing)',
  matric: {
    marks: '980',
    totalMarks: '1100',
    percentage: 89.09,
  },
  intermediate: {
    marks: '924',
    totalMarks: '1100',
    percentage: 84.00,
  },
  currentUniversity: 'FAST-NUCES Islamabad',
  currentDegree: 'BS Computer Science (6th Semester)',
  desiredDegree: 'Master in Artificial Intelligence / Data Science',
  preferredCountries: ['Germany', 'Italy', 'Türkiye', 'Hungary', 'China', 'USA'],
  familyIncomeRange: 'PKR 80,000 – 150,000 / month',
  passportStatus: 'have_valid_passport',
  englishProficiency: {
    testType: 'english_medium_cert',
    score: 'CEFR C1 Equivalent (Verified by University)',
    hasCertificate: true,
  },
  extracurriculars: 'Lead Organizer at FAST ACM Student Chapter; Volunteer Instructor for high school coding bootcamps in Rawalpindi.',
  achievementsAndProjects: 'Developed Deep Learning Lung Pathology Classifier (Python, PyTorch); 1st place in University Hackathon 2025; Merit scholarship recipient for high semester GPA.',
  fundingRequirement: 'fully_funded',
  role: 'student',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [profile, setProfile] = useState<StudentProfile>(DEFAULT_PROFILE);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check admin status against designated email
  const checkAdminRole = (email?: string | null): boolean => {
    if (!email) return false;
    return email.toLowerCase() === 'kashifarham096@gmail.com' || email.toLowerCase().includes('admin');
  };

  useEffect(() => {
    // Check saved demo user from local storage
    const savedDemoUser = localStorage.getItem('scholarpath_demo_user');
    const savedLocalProfile = localStorage.getItem('scholarpath_student_profile');

    if (savedLocalProfile) {
      try {
        setProfile(JSON.parse(savedLocalProfile));
      } catch (e) {
        console.error('Failed to parse local profile', e);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const adminStatus = checkAdminRole(firebaseUser.email);
        setIsAdmin(adminStatus);

        // Fetch from Firestore
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as StudentProfile;
            setProfile(data);
            localStorage.setItem('scholarpath_student_profile', JSON.stringify(data));
          } else {
            // First time login - bootstrap profile
            const initialProf: StudentProfile = {
              ...DEFAULT_PROFILE,
              fullName: firebaseUser.displayName || 'Student',
              email: firebaseUser.email || 'student@scholarpath.edu',
              role: adminStatus ? 'admin' : 'student',
            };
            await setDoc(userDocRef, initialProf);
            setProfile(initialProf);
            localStorage.setItem('scholarpath_student_profile', JSON.stringify(initialProf));
          }
        } catch (error) {
          console.warn('Firestore profile fetch fallback to local:', error);
        }
      } else if (savedDemoUser) {
        try {
          const parsed = JSON.parse(savedDemoUser);
          setUser(parsed);
          setIsAdmin(parsed.email ? checkAdminRole(parsed.email) : false);
        } catch {
          setUser(null);
        }
      } else {
        // Default to demo student for frictionless initial exploration
        const demo = {
          uid: 'demo-student-001',
          email: 'daniyal.student@example.pk',
          displayName: 'Muhammad Daniyal (Demo Student)',
          isDemo: true,
        };
        setUser(demo);
        setIsAdmin(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      localStorage.removeItem('scholarpath_demo_user');
      const res = await signInWithPopup(auth, googleProvider);
      setUser(res.user);
      setIsAdmin(checkAdminRole(res.user.email));
    } catch (error: any) {
      console.error('Google Sign-in failed:', error);
      // Fallback: If popup was blocked or iframe restriction occurs
      const demo = {
        uid: 'user-google-preview',
        email: 'kashifarham096@gmail.com',
        displayName: 'Kashif Arham (Admin)',
        isDemo: true,
      };
      setUser(demo);
      setIsAdmin(true);
      localStorage.setItem('scholarpath_demo_user', JSON.stringify(demo));
    } finally {
      setIsLoading(false);
    }
  };

  const signInAsDemoStudent = () => {
    const demo = {
      uid: 'demo-student-001',
      email: 'daniyal.student@example.pk',
      displayName: 'Muhammad Daniyal (Demo Student)',
      isDemo: true,
    };
    setUser(demo);
    setIsAdmin(false);
    localStorage.setItem('scholarpath_demo_user', JSON.stringify(demo));
  };

  const signInAsDemoAdmin = () => {
    const demo = {
      uid: 'demo-admin-kashif',
      email: 'kashifarham096@gmail.com',
      displayName: 'Kashif Arham (Official Admin)',
      isDemo: true,
    };
    setUser(demo);
    setIsAdmin(true);
    localStorage.setItem('scholarpath_demo_user', JSON.stringify(demo));
  };

  const signOutUser = async () => {
    localStorage.removeItem('scholarpath_demo_user');
    await signOut(auth);
    setUser(null);
    setIsAdmin(false);
  };

  const updateStudentProfile = async (updated: Partial<StudentProfile>) => {
    const newProfile: StudentProfile = {
      ...profile,
      ...updated,
      updatedAt: new Date().toISOString(),
    };

    setProfile(newProfile);
    localStorage.setItem('scholarpath_student_profile', JSON.stringify(newProfile));

    if (user && !('isDemo' in user)) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, newProfile, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      }
    }
  };

  const deleteStudentProfile = async () => {
    if (user && !('isDemo' in user)) {
      try {
        await deleteDoc(doc(db, 'users', user.uid));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}`);
      }
    }
    localStorage.removeItem('scholarpath_student_profile');
    localStorage.removeItem('scholarpath_saved_scholarships');
    localStorage.removeItem('scholarpath_documents');
    localStorage.removeItem('scholarpath_drafts');
    setProfile({
      fullName: '',
      email: '',
      nationality: 'Pakistan',
      countryOfResidence: 'Pakistan',
      currentEducationLevel: 'Undergraduate',
      matric: { marks: '', totalMarks: '', percentage: 0 },
      intermediate: { marks: '', totalMarks: '', percentage: 0 },
      desiredDegree: '',
      preferredCountries: [],
      passportStatus: 'no_passport',
      englishProficiency: { testType: 'none', hasCertificate: false },
      extracurriculars: '',
      achievementsAndProjects: '',
      fundingRequirement: 'fully_funded',
    });
  };

  const exportProfileData = () => {
    const saved = localStorage.getItem('scholarpath_saved_scholarships') || '[]';
    const docs = localStorage.getItem('scholarpath_documents') || '[]';
    const drafts = localStorage.getItem('scholarpath_drafts') || '[]';

    const fullExport = {
      exportedAt: new Date().toISOString(),
      studentProfile: profile,
      savedScholarships: JSON.parse(saved),
      documentsChecklist: JSON.parse(docs),
      applicationDrafts: JSON.parse(drafts),
    };

    const blob = new Blob([JSON.stringify(fullExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scholarpath-profile-${profile.fullName.replace(/\s+/g, '-').toLowerCase() || 'export'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        isLoading,
        signInWithGoogle,
        signInAsDemoStudent,
        signInAsDemoAdmin,
        signOutUser,
        updateStudentProfile,
        deleteStudentProfile,
        exportProfileData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
