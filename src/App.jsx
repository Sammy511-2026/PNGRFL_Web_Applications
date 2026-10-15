import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { majorCompetitions, nestedCompetitions, getCompetitionSlug } from './data/Competitions'

/* ================= PAGES ================= */
import Home from './pages/Home'
import Teams from './pages/Teams'
import TeamDetails from './pages/TeamDetails'
import MatchCentre from './pages/MatchCentre'
import MatchDraw from './pages/MatchDraw'
import Ladder from './pages/Ladder'
import Shop from './pages/Shop'
import Fixtures from './pages/Fixtures'
import Leagues from './pages/Leagues'
import CompetitionPage from './pages/CompetitionPage'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminSignup from './pages/admin/AdminSignup'
import ContentPage from './pages/ContentPage'

/* ================= ASSETS ================= */
import pngRflLogo from './assets/logos/pngrfl.jpg'
import './App.css'

export default function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <AppLayout />
    </Router>
  )
}

function AppLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <div className="app-container">

        {/* ================= NAVBAR ================= */}
        <nav className="navbar" aria-label="Primary navigation">
          {/* Logo */}
          <Link to="/" className="navbar-logo" onClick={closeMenu}>
            <img src={pngRflLogo} alt="PNG RFL Logo" />
          </Link>

          <button
            type="button"
            className={`menu-toggle${isMenuOpen ? ' is-open' : ''}`}
            aria-expanded={isMenuOpen}
            aria-controls="primary-navigation"
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setIsMenuOpen(open => !open)}
          >
            <span />
            <span />
            <span />
          </button>

          {/* Navigation Links */}
          <ul id="primary-navigation" className={`nav-links${isMenuOpen ? ' is-open' : ''}`}>
            <li><Link to="/" onClick={closeMenu}>Home</Link></li>

            <li className="nav-dropdown">
              <details className="competition-dropdown">
                <summary className="competition-dropdown-trigger">Major Competitions</summary>
                <ul className="nav-dropdown-menu">
                  {majorCompetitions.map(competition => {
                    const nested = nestedCompetitions[competition] || []
                    return nested.length
                      ? (
                        <li className="nav-cup-dropdown" key={competition}>
                          <details>
                            <summary className="competition-submenu-trigger">{competition}</summary>
                            <ul>
                              <li>
                                <Link to={`/competitions/${getCompetitionSlug(competition)}`} onClick={closeMenu}>
                                  {competition}
                                </Link>
                              </li>
                              {nested.map(subCompetition => (
                                <li key={subCompetition}>
                                  <Link to={`/competitions/${getCompetitionSlug(subCompetition)}`} onClick={closeMenu}>
                                    {subCompetition}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </details>
                        </li>
                      )
                      : (
                        <li key={competition}>
                          <Link to={`/competitions/${getCompetitionSlug(competition)}`} onClick={closeMenu}>
                            {competition}
                          </Link>
                        </li>
                      )
                  })}
                </ul>
              </details>
            </li>

            <li><Link to="/leagues" onClick={closeMenu}>Leagues</Link></li>

            {/* Future-ready sections */}
            <li><Link to="/rules" onClick={closeMenu}>Rules</Link></li>
            <li><Link to="/board" onClick={closeMenu}>PNG RFL Board</Link></li>

            <li><Link to="/shop" onClick={closeMenu}>Shop</Link></li>
          </ul>
        </nav>

        {/* ================= ROUTES ================= */}
        <main key={location.pathname}>
          <Routes>

          {/* ---------- CORE ---------- */}
          <Route path="/" element={<Home />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/teams/:teamId/:tab" element={<TeamDetails />} />
          <Route path="/teams/:teamId" element={<TeamDetails />} />
          <Route path="/competitions/:competitionSlug" element={<CompetitionPage />} />

          {/* ---------- COMPETITION ---------- */}
          <Route path="/matches" element={<MatchCentre />} />
          <Route path="/matches/:matchId" element={<MatchDraw />} />
          <Route path="/fixtures" element={<Fixtures />} />
          <Route path="/leagues" element={<Leagues />} />
          <Route path="/ladder" element={<Ladder />} />

          {/* ---------- COMMERCIAL ---------- */}
          <Route path="/shop" element={<Shop />} />

          {/* ---------- ADMIN ---------- */}
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/signup" element={<AdminSignup />} />

          {/* ---------- PLACEHOLDERS (SAFE) ---------- */}
          <Route
            path="/competitions"
            element={<ContentPage page="competitions" />}
          />
          <Route
            path="/rules"
            element={<ContentPage page="rules" />}
          />
          <Route
            path="/board"
            element={<ContentPage page="board" />}
          />

          </Routes>
        </main>

        {/* ================= FOOTER ================= */}
        <footer className="footer">
          <p>© {new Date().getFullYear()} PNG Rugby Football League</p>
        </footer>

    </div>
  )
}
