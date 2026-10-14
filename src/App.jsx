import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'

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
              <details>
                <summary>Major Competitions</summary>
                <ul className="nav-dropdown-menu">
                  <li className="nav-cup-dropdown">
                    <details>
                      <summary>Digicel ExxonMobil Cup</summary>
                      <ul>
                        <li><Link to="/fixtures?competition=Digicel%20ExxonMobil%20Cup" onClick={closeMenu}>Cup draw and stats</Link></li>
                        <li><Link to="/fixtures?competition=Women%E2%80%99s%20Rugby%20League" onClick={closeMenu}>Women’s Competition</Link></li>
                        <li><Link to="/teams" onClick={closeMenu}>Teams</Link></li>
                      </ul>
                    </details>
                  </li>
                  <li><Link to="/fixtures?competition=National%20Schoolboys%20Championship" onClick={closeMenu}>National Schoolboys Championship</Link></li>
                </ul>
              </details>
            </li>

            {/* Match Centre handles Fixtures & Results */}
            <li><Link to="/matches" onClick={closeMenu}>Draw & Results</Link></li>
            <li><Link to="/leagues" onClick={closeMenu}>Leagues</Link></li>

            {/* Future-ready sections */}
            <li><Link to="/fixtures" onClick={closeMenu}>All Fixtures</Link></li>
            <li><Link to="/rules" onClick={closeMenu}>Rules</Link></li>
            <li><Link to="/board" onClick={closeMenu}>PNG RFL Board</Link></li>

            <li><Link to="/ladder" onClick={closeMenu}>Ladder</Link></li>
            <li><Link to="/shop" onClick={closeMenu}>Shop</Link></li>
            <li><Link to="/admin" onClick={closeMenu}>Admin</Link></li>
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
