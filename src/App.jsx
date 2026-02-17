import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Ranking from './pages/Ranking';
import OrganizerLogin from './pages/OrganizerLogin';
import OrganizerDashboard from './pages/OrganizerDashboard';
import CreateQuestionSession from './pages/CreateQuestionSession';
import SearchCompetition from './pages/SearchCompetition';
import AnswerQuestions from './pages/AnswerQuestions';
import CorrectSubmissions from './pages/CorrectSubmissions';
import QuizOfTheDay from './pages/QuizOfTheDay';
import CreateCompetition from './pages/CreateCompetition';
import CompetitionQuestions from './pages/CompetitionQuestions';
import OrganizerCorrectCompetition from './pages/OrganizerCorrectCompetition';
import PublicArchives from './pages/PublicArchives';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="pt-8">
              <Routes>
                {/* Routes publiques */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/ranking" element={<Ranking />} />
                <Route path="/archives" element={<PublicArchives />} />
                <Route path="/organizer-login" element={<OrganizerLogin />} />
                <Route path="*" element={<Home />} />

                {/* Routes Joueurs */}
                <Route
                  path="/search-competition"
                  element={
                    <ProtectedRoute>
                      <SearchCompetition />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/quiz"
                  element={
                    <ProtectedRoute>
                      <QuizOfTheDay />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/quiz/:sessionId"
                  element={
                    <ProtectedRoute>
                      <AnswerQuestions />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/competition/:competitionId"
                  element={
                    <ProtectedRoute>
                      <CompetitionQuestions />
                    </ProtectedRoute>
                  }
                />

                {/* Routes Organisateur */}
                <Route
                  path="/organizer/dashboard"
                  element={
                    <ProtectedRoute requireOrganizer={true}>
                      <OrganizerDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/organizer/create-competition"
                  element={
                    <ProtectedRoute requireOrganizer={true}>
                      <CreateCompetition />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/organizer/competition/:competitionId/create-session"
                  element={
                    <ProtectedRoute requireOrganizer={true}>
                      <CreateQuestionSession />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/organizer/competition/:competitionId"
                  element={
                    <ProtectedRoute requireOrganizer={true}>
                      <OrganizerCorrectCompetition />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/organizer/correct-submissions/:sessionId"
                  element={
                    <ProtectedRoute requireOrganizer={true}>
                      <CorrectSubmissions />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
