import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ProjectCard } from './components/ProjectCard';
import { RecentRequests } from './components/RecentRequests';
import { CrewDirectory } from './components/CrewDirectory';
import { AiAssistant } from './components/AiAssistant';
import { RecentChats } from './components/RecentChats';

import { ConnectModal } from './components/Modals/ConnectModal';
import { IncomingRequestsModal } from './components/Modals/IncomingRequestsModal';
import { ReportModal } from './components/Modals/ReportModal';
import { PortfolioModal } from './components/Modals/PortfolioModal';
import { AddProjectModal } from './components/Modals/AddProjectModal';
import { AuthModal } from './components/Modals/AuthModal';
import { ModerationDashboard } from './components/ModerationDashboard';
import { SuspendedModal } from './components/Modals/SuspendedModal';
import { SmtpSettingsModal } from './components/Modals/SmtpSettingsModal';

import { api } from './services/api';
import { useAuth } from './context/AuthContext';
import { Plus, Sparkles, FolderKanban, Users } from 'lucide-react';

export function App() {
  const { user } = useAuth();

  // State
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('projects'); // 'projects' | 'discovery' | 'inbox'
  const [crew, setCrew] = useState([]);
  const [projects, setProjects] = useState([]);
  const [feedbackRequests, setFeedbackRequests] = useState([]);
  const [loadingCrew, setLoadingCrew] = useState(true);

  // Modals state
  const [connectModalUser, setConnectModalUser] = useState(null);
  const [reportModalUser, setReportModalUser] = useState(null);
  const [portfolioModalUser, setPortfolioModalUser] = useState(null);
  const [showInboxModal, setShowInboxModal] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showModerationDashboard, setShowModerationDashboard] = useState(false);
  const [showSmtpModal, setShowSmtpModal] = useState(false);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [showMobileAi, setShowMobileAi] = useState(false);

  // Fetch Crew Directory with category & search filters
  const loadCrew = async () => {
    setLoadingCrew(true);
    try {
      const data = await api.getCrew({
        category: selectedCategory !== 'all' ? selectedCategory : '',
        search: searchQuery
      });
      setCrew(data.crew || []);
    } catch (err) {
      console.error('Failed to load crew:', err);
    } finally {
      setLoadingCrew(false);
    }
  };

  // Fetch Projects & Feedbacks
  const loadProjects = async () => {
    try {
      const data = await api.getProjects();
      setProjects(data.projects || []);
      setFeedbackRequests(data.feedbackRequests || []);
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  };

  useEffect(() => {
    loadCrew();
  }, [selectedCategory, searchQuery, user]);

  useEffect(() => {
    loadProjects();
  }, [user]);

  const featuredProject = projects[0] || {
    title: 'ECHOES OF SILENCE',
    subtitle: 'Short Film - Neo-Noir / Psychological Drama',
    status: 'Active',
    progress: 65,
    budget: { spent: 2100, total: 3000 },
    upcoming: { count: 2, label: '2 Cast Interviews (Today)' },
    recentUpdates: [
      { text: "Shot list approved and crew notified for 'Night Street' scene", badge: 'Shot List' },
      { text: 'Script changes finalized and sent to all', badge: 'Script' }
    ]
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        onOpenAi={() => setShowMobileAi(true)}
        onOpenNotifications={() => setShowInboxModal(true)}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenModeration={() => setShowModerationDashboard(true)}
        onOpenSmtp={() => setShowSmtpModal(true)}
      />

      {/* Main Container */}
      <div className="flex-1 max-w-[1720px] w-full mx-auto flex">
        
        {/* Left Sidebar */}
        <Sidebar
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setActiveTab('discovery');
          }}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAi={() => setShowMobileAi(true)}
          onOpenInbox={() => setShowInboxModal(true)}
          onOpenModeration={() => setShowModerationDashboard(true)}
          onOpenAddProject={() => setShowAddProjectModal(true)}
          searchQuery={searchQuery}
          onSearchChange={(q) => setSearchQuery(q)}
        />

        {/* Center Main Dashboard Area */}
        <main className="flex-1 min-w-0 p-4 lg:p-6 overflow-y-auto space-y-6">
          
          {/* Dashboard Header Bar matching screenshot: "GOCRATERS - DASHBOARD" */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                Production Hub
              </span>
              <h1 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">
                GOCRATERS - DASHBOARD
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddProjectModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4 text-blue-400" />
                <span>+ Add Project</span>
              </button>
            </div>
          </div>

          {/* Section: My Projects */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800">
                My Projects
              </h2>
              <span className="text-xs text-blue-600 font-semibold cursor-pointer hover:underline">
                View all ({projects.length || 1})
              </span>
            </div>

            {/* Featured Project Card matching "ECHOES OF SILENCE" */}
            <ProjectCard
              project={featuredProject}
              onRefresh={loadProjects}
              onFindCrew={() => {
                setActiveTab('discovery');
                setSelectedCategory('cinematographer');
              }}
            />
          </section>

          {/* Section: Recent Requests & Timeline */}
          <section>
            <RecentRequests
              requests={feedbackRequests}
              onRefresh={loadProjects}
            />
          </section>

          {/* Section: Crew Discovery & Networking */}
          <section className="space-y-3 pt-2">
            <CrewDirectory
              crew={crew}
              loading={loadingCrew}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onConnect={(member) => setConnectModalUser(member)}
              onReport={(member) => setReportModalUser(member)}
              onViewPortfolio={(member) => setPortfolioModalUser(member)}
              onChat={(member) => setActiveChatUser(member)}
              onRefresh={loadCrew}
            />
          </section>

        </main>

        {/* Right Panels (Desktop Assistant & Chats matching screenshot) */}
        <aside className="w-80 xl:w-96 flex-shrink-0 hidden xl:flex flex-col gap-5 p-4 lg:p-6 border-l border-slate-200 bg-slate-50/50 sticky top-[61px] h-[calc(100vh-61px)] overflow-y-auto scrollbar-thin">
          
          {/* GoCreators AI Assistant Panel */}
          <div className="h-[430px]">
            <AiAssistant
              onNavigateCategory={(cat) => {
                setSelectedCategory(cat);
                setActiveTab('discovery');
              }}
            />
          </div>

          {/* Recent Chats Panel */}
          <div>
            <RecentChats
              activeChatUser={activeChatUser}
              onSelectChatUser={(u) => setActiveChatUser(u)}
            />
          </div>

        </aside>

      </div>

      {/* Mobile AI Assistant Drawer */}
      {showMobileAi && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 xl:hidden">
          <div className="w-full max-w-lg h-[640px]">
            <AiAssistant
              onClose={() => setShowMobileAi(false)}
              onNavigateCategory={(cat) => {
                setSelectedCategory(cat);
                setShowMobileAi(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Interactive Modals */}
      <ConnectModal
        targetUser={connectModalUser}
        onClose={() => setConnectModalUser(null)}
        onSuccess={() => {
          loadCrew();
          setConnectModalUser(null);
        }}
      />

      <IncomingRequestsModal
        isOpen={showInboxModal}
        onClose={() => setShowInboxModal(false)}
        onRefreshCrew={loadCrew}
      />

      <ReportModal
        targetUser={reportModalUser}
        onClose={() => setReportModalUser(null)}
        onSuccess={() => {
          loadCrew();
          setReportModalUser(null);
        }}
      />

      <PortfolioModal
        crewMember={portfolioModalUser}
        onClose={() => setPortfolioModalUser(null)}
        onRefresh={loadCrew}
      />

      <AddProjectModal
        isOpen={showAddProjectModal}
        onClose={() => setShowAddProjectModal(false)}
        onSuccess={loadProjects}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      <ModerationDashboard
        isOpen={showModerationDashboard}
        onClose={() => setShowModerationDashboard(false)}
        onRefreshCrew={loadCrew}
      />

      <SmtpSettingsModal
        isOpen={showSmtpModal}
        onClose={() => setShowSmtpModal(false)}
      />

      {/* Auto-Ban / Suspension Modal */}
      <SuspendedModal />

    </div>
  );
}

export default App;

