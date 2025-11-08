import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthForm } from './components/AuthForm';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Courses } from './pages/Courses';
import { Skills } from './pages/Skills';
import { CareerPaths } from './pages/CareerPaths';
import { Profile } from './pages/Profile';
import { Recommendations } from './pages/Recommendations';
import { Jobs } from './pages/Jobs';
import { Mentorship } from './pages/Mentorship';
import { EducatorDashboard } from './pages/EducatorDashboard';
import { RecruiterDashboard } from './pages/RecruiterDashboard';

type Page =
  | 'dashboard'
  | 'courses'
  | 'career'
  | 'profile'
  | 'skills'
  | 'recommendations'
  | 'jobs'
  | 'mentorship'
  | 'educator'
  | 'recruiter';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'courses':
        return <Courses />;
      case 'skills':
        return <Skills />;
      case 'career':
        return <CareerPaths />;
      case 'recommendations':
        return <Recommendations />;
      case 'jobs':
        return <Jobs />;
      case 'mentorship':
        return <Mentorship />;
      case 'educator':
        return <EducatorDashboard />;
      case 'recruiter':
        return <RecruiterDashboard />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
