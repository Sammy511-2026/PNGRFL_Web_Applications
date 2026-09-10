import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'

/* ================= PAGES ================= */
import Home from './pages/Home'
import Teams from './pages/Teams'
import TeamDetails from './pages/TeamDetails'
import MatchCentre from './pages/MatchCentre'
import Ladder from './pages/Ladder'
import Shop from './pages/Shop'
import Fixtures from './pages/Fixtures'
import Leagues from './pages/Leagues'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminSignup from './pages/admin/AdminSignup'

/* ================= ASSETS ================= */
import pngRflLogo from './assets/logos/pngrfl.jpg'
import './App.css'

export default function App() {
  return (
    <Router>
      <div className="app-container">

        {/* ================= NAVBAR ================= */}
        <nav className="navbar">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <img src={pngRflLogo} alt="PNG RFL Logo" />
          </Link>

          {/* Navigation Links */}
          <ul className="nav-links">
            <li><Link to="/">Home</Link></li>

            <li><Link to="/teams">Teams</Link></li>

            {/* Match Centre handles Fixtures & Results */}
            <li><Link to="/matches">Fixtures</Link></li>
            <li><Link to="/matches">Results</Link></li>

            {/* Future-ready sections */}
            <li><Link to="/competitions">Major Competitions</Link></li>
            <li><Link to="/rules">Rules</Link></li>
            <li><Link to="/board">PNG RFL Board</Link></li>

            <li><Link to="/ladder">Ladder</Link></li>
            <li><Link to="/shop">Shop</Link></li>
            <li><Link to="/admin">Admin</Link></li>
          </ul>
        </nav>

        {/* ================= ROUTES ================= */}
        <Routes>

          {/* ---------- CORE ---------- */}
          <Route path="/" element={<Home />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/teams/:teamId" element={<TeamDetails />} />

          {/* ---------- COMPETITION ---------- */}
          <Route path="/matches" element={<MatchCentre />} />
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
            element={<Placeholder title="Major Competitions" />}
          />
          <Route
            path="/rules"
            element={<Placeholder title="Rules & Regulations" />}
          />
          <Route
            path="/board"
            element={<Placeholder title="PNG RFL Board" />}
          />

        </Routes>

        {/* ================= FOOTER ================= */}
        <footer className="footer">
          <p>© {new Date().getFullYear()} PNG Rugby Football League</p>
        </footer>

      </div>
    </Router>
  )
}

/* ================= TEMP PLACEHOLDER ================= */
function Placeholder({ title }) {
  return (
    <main className="placeholder-page">
      <h1>{title}</h1>
      <p>Content will be published soon.</p>
    </main>
  )
}
