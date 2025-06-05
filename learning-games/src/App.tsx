import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import AgeInputForm from './pages/AgeInputForm'
import SplashPage from './pages/SplashPage'
import Match3Game from './pages/Match3Game'
import QuizGame from './pages/QuizGame'
import DragDropGame from './pages/DragDropGame'
import LeaderboardPage from './pages/LeaderboardPage'
import { Toaster } from 'react-hot-toast'
import NavBar from './components/layout/NavBar'
import Footer from './components/layout/Footer'
import './App.css'

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/age" element={<AgeInputForm />} />
        <Route path="/welcome" element={<SplashPage />} />
        <Route path="/" element={<Home />} />
        <Route path="/games/match3" element={<Match3Game />} />
        <Route path="/games/quiz" element={<QuizGame />} />
        <Route path="/games/dragdrop" element={<DragDropGame />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
      </Routes>
      {/* Verification comment: routes render correctly with context */}
      <Toaster />
      <Footer />
    </Router>
  )
}

export default App
