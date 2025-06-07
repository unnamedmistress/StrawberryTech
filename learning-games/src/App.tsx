import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import AgeInputForm from './pages/AgeInputForm'
import SplashPage from './pages/SplashPage'
import Match3Game from './pages/Match3Game'
import QuizGame from './pages/QuizGame'
import PromptRecipeGame from './pages/PromptRecipeGame'
import PromptDartsGame from './pages/PromptDartsGame'
import PromptGuessEscape from './pages/PromptGuessEscape'

import ClarityEscapeRoom from './pages/ClarityEscapeRoom'

import LeaderboardPage from './pages/LeaderboardPage'
import CommunityPage from './pages/CommunityPage'
import CommunityPlaylistPage from './pages/CommunityPlaylistPage'
import ProfilePage from './pages/ProfilePage'
import HelpPage from './pages/HelpPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import ContactPage from './pages/ContactPage'
import StatsPage from './pages/StatsPage'
import BadgesPage from './pages/BadgesPage'
import { Toaster } from 'react-hot-toast'
import NavBar from './components/layout/NavBar'
import Footer from './components/layout/Footer'
import AnalyticsTracker from './components/AnalyticsTracker'
import ScrollToTop from './components/ScrollToTop'
import './App.css'

function App() {
  return (
    <Router>
      <ScrollToTop />
      <NavBar />
      <AnalyticsTracker />
      <Routes>
        <Route path="/age" element={<AgeInputForm />} />
        <Route path="/welcome" element={<SplashPage />} />
        <Route path="/" element={<Home />} />
        <Route path="/games/tone" element={<Match3Game />} />
        <Route path="/games/quiz" element={<QuizGame />} />
        <Route path="/games/recipe" element={<PromptRecipeGame />} />
        <Route path="/games/darts" element={<PromptDartsGame />} />
        <Route path="/games/guess" element={<PromptGuessEscape />} />
        <Route path="/prompt-builder" element={<PromptRecipeGame />} />

        <Route path="/games/escape" element={<ClarityEscapeRoom />} />

        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/badges" element={<BadgesPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/playlist" element={<CommunityPlaylistPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/stats" element={<StatsPage />} />
      </Routes>
      {/* Verification comment: routes render correctly with context */}
      <Toaster
        toastOptions={{
          ariaProps: { role: 'status', 'aria-live': 'polite' },
        }}
      />
      <Footer />
    </Router>
  )
}

export default App
