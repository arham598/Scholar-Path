import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import { Header } from './components/common/Header';
import { Sidebar, NavigationTab } from './components/common/Sidebar';
import { AuthModal } from './components/common/AuthModal';
import { ScholarshipDetailModal } from './components/common/ScholarshipDetailModal';
import { ToastContainer } from './components/notifications/ToastContainer';
import { NotificationDrawer } from './components/notifications/NotificationDrawer';
import { DashboardView } from './components/dashboard/DashboardView';
import { StudentProfileView } from './components/profile/StudentProfileView';
import { ScholarshipFinderView } from './components/finder/ScholarshipFinderView';
import { EligibilityCheckerView } from './components/eligibility/EligibilityCheckerView';
import { ApplicationAssistantView } from './components/assistant/ApplicationAssistantView';
import { DocumentManagerView } from './components/documents/DocumentManagerView';
import { DeadlineTrackerView } from './components/deadlines/DeadlineTrackerView';
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import { Scholarship } from './types/scholarship';
import { scholarshipService } from './services/scholarshipService';

function MainAppContent() {
  const { user, profile } = useAuth();
  const { evaluateNotifications } = useNotifications();

  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [savedScholarshipIds, setSavedScholarshipIds] = useState<string[]>([]);
  const [selectedScholarshipForAction, setSelectedScholarshipForAction] = useState<Scholarship | null>(null);
  const [detailModalScholarship, setDetailModalScholarship] = useState<Scholarship | null>(null);
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');

  // Initial data loading
  const loadData = async () => {
    const list = await scholarshipService.getScholarships();
    setScholarships(list);
    const saved = scholarshipService.getLocalSavedScholarships();
    setSavedScholarshipIds(saved.map((s) => s.scholarshipId));

    // Run automatic evaluation for 7-day deadlines & matching profile interests
    evaluateNotifications(list, profile, saved);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Re-run evaluation when profile preferred countries or target degree changes
  useEffect(() => {
    if (scholarships.length > 0) {
      const saved = scholarshipService.getLocalSavedScholarships();
      evaluateNotifications(scholarships, profile, saved);
    }
  }, [profile, scholarships, evaluateNotifications]);

  const handleToggleSaveScholarship = async (scholarship: Scholarship) => {
    if (savedScholarshipIds.includes(scholarship.id)) {
      await scholarshipService.removeSavedScholarship(user?.uid || 'demo-user', scholarship.id);
      setSavedScholarshipIds((prev) => prev.filter((id) => id !== scholarship.id));
    } else {
      await scholarshipService.saveScholarship(user?.uid || 'demo-user', scholarship);
      setSavedScholarshipIds((prev) => [...prev, scholarship.id]);
    }
  };

  const handleCheckEligibility = (scholarship: Scholarship) => {
    setSelectedScholarshipForAction(scholarship);
    setActiveTab('eligibility');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAssistant = (scholarship: Scholarship) => {
    setSelectedScholarshipForAction(scholarship);
    setActiveTab('assistant');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const docs = scholarshipService.getDocuments();
  const missingDocsCount = docs.filter((d) => d.status === 'missing').length;

  return (
    <div className="min-h-screen bg-[#060D1A] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] antialiased selection:bg-sky-500 selection:text-white relative">
      
      {/* Top Header with Notification Bell */}
      <Header
        onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
        onSearchQueryChange={(query) => setHeaderSearchQuery(query)}
        onNavigateToFinder={() => setActiveTab('finder')}
        currentActiveTab={activeTab}
      />

      {/* Main Workspace with Sidebar */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          savedCount={savedScholarshipIds.length}
          documentsMissingCount={missingDocsCount}
        />

        {/* Dynamic Main View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              scholarships={scholarships}
              savedScholarships={scholarshipService.getLocalSavedScholarships()}
              documents={docs}
              onNavigate={(tab) => {
                setActiveTab(tab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectScholarshipForDetails={(s) => setDetailModalScholarship(s)}
              onCheckEligibilityForScholarship={handleCheckEligibility}
              onOpenAssistantForScholarship={handleOpenAssistant}
            />
          )}

          {activeTab === 'finder' && (
            <ScholarshipFinderView
              scholarships={scholarships}
              savedScholarshipIds={savedScholarshipIds}
              onToggleSaveScholarship={handleToggleSaveScholarship}
              onCheckEligibility={handleCheckEligibility}
              onOpenAssistantForScholarship={handleOpenAssistant}
              initialSearchQuery={headerSearchQuery}
            />
          )}

          {activeTab === 'profile' && (
            <StudentProfileView
              onNavigateToEligibility={() => {
                setActiveTab('eligibility');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {activeTab === 'eligibility' && (
            <EligibilityCheckerView
              scholarships={scholarships}
              selectedScholarship={selectedScholarshipForAction}
              onOpenAssistantForScholarship={handleOpenAssistant}
              onNavigateToProfile={() => setActiveTab('profile')}
            />
          )}

          {activeTab === 'assistant' && (
            <ApplicationAssistantView
              scholarships={scholarships}
              preselectedScholarship={selectedScholarshipForAction}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentManagerView />
          )}

          {activeTab === 'deadlines' && (
            <DeadlineTrackerView
              scholarships={scholarships}
              onNavigateToFinder={() => setActiveTab('finder')}
              onOpenAssistantForScholarship={handleOpenAssistant}
            />
          )}

          {activeTab === 'admin' && (
            <AdminDashboardView
              scholarships={scholarships}
              onRefreshScholarships={loadData}
            />
          )}
        </main>
      </div>

      {/* Floating Real-Time In-App Toast Container */}
      <ToastContainer
        onOpenScholarshipDetails={(id) => {
          const s = scholarships.find((item) => item.id === id);
          if (s) setDetailModalScholarship(s);
        }}
        onNavigateToTab={(tab) => setActiveTab(tab as NavigationTab)}
      />

      {/* Notification Center Slide-over Drawer */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        onSelectScholarship={(id) => {
          const s = scholarships.find((item) => item.id === id);
          if (s) setDetailModalScholarship(s);
        }}
        onNavigateToTab={(tab) => setActiveTab(tab as NavigationTab)}
      />

      {/* Global Quick Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <ScholarshipDetailModal
        scholarship={detailModalScholarship}
        isOpen={detailModalScholarship !== null}
        onClose={() => setDetailModalScholarship(null)}
        isSaved={detailModalScholarship ? savedScholarshipIds.includes(detailModalScholarship.id) : false}
        onToggleSave={handleToggleSaveScholarship}
        onCheckEligibility={handleCheckEligibility}
        onOpenAssistantForScholarship={handleOpenAssistant}
      />

      {/* Trust Footer */}
      <footer className="border-t border-slate-800/80 bg-[#060D1A] text-slate-400 text-xs py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <div className="font-bold text-slate-200">
              ScholarPath — Global Scholarship Finder &amp; Application Assistant
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Your Future. Your Scholarship. Your Path. • Dedicated to students in Pakistan and worldwide.
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
            <span className="text-slate-400">Strictly Published Criteria</span>
            <span>•</span>
            <span className="text-slate-400">IBCC &amp; HEC Compliant</span>
            <span>•</span>
            <span className="text-sky-400 font-medium">Gemini 3.8 Flash Powered</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <MainAppContent />
      </NotificationProvider>
    </AuthProvider>
  );
}
