import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Match3Game from './pages/Match3Game'
import QuizGame from './pages/QuizGame'
import DragDropGame from './pages/DragDropGame'
import LeaderboardPage from './pages/LeaderboardPage'
import './App.css'

function App() {
  return (
    <Router>
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/games/match3">Match-3</Link></li>
          <li><Link to="/games/quiz">Quiz</Link></li>
          <li><Link to="/games/dragdrop">Drag & Drop</Link></li>
          <li><Link to="/leaderboard">Leaderboard</Link></li>
        </ul>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/games/match3" element={<Match3Game />} />
        <Route path="/games/quiz" element={<QuizGame />} />
        <Route path="/games/dragdrop" element={<DragDropGame />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
      </Routes>
    </Router>
  )
}

export default App
