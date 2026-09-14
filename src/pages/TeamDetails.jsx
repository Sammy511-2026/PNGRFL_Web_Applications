import { useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getTeamById } from '../api/resources'
import PlayersList from '../Components/teams/PlayersList'
import TeamSkeleton from '../Components/ui/TeamSkeleton'
import { useApi } from '../hooks/useApi'
import RequestState from '../Components/ui/RequestState'
import './TeamDetails.css'

const TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'squad', label: 'Squad' },
    { key: 'fixtures', label: 'Fixtures & Results' },
    { key: 'ladder', label: 'Ladder' },
    { key: 'honours', label: 'Honours' },
    { key: 'staff', label: 'Coaching Staff' },
    { key: 'stats', label: 'Stats' }
]

export default function TeamDetails() {
    const { teamId, tab } = useParams()
    const navigate = useNavigate()
    const loadTeam = useCallback(() => getTeamById(teamId), [teamId])
    const { data: rawTeam, isLoading, error, reload } = useApi(loadTeam, null)

    const activeTab = tab || 'overview'

    if (isLoading) return <main className="page"><TeamSkeleton /></main>
    if (error) {
        return <main className="page"><RequestState isLoading={false} error={error} onRetry={reload} /></main>
    }
    if (!rawTeam) {
        return <p className="not-found">Team not found</p>
    }

    // Redirect invalid tab
    if (!TABS.some(t => t.key === activeTab)) {
        navigate(`/teams/${teamId}/overview`, { replace: true })
        return null
    }

    const team = {
        description: '',
        tagline: '',
        banner: '',
        honours: [],
        players: [],
        staff: [],
        fixtures: [],
        stats: {},
        colors: [],
        founded: '',
        homeGround: '',
        coach: '',
        captain: '',
        ...rawTeam
    }

    return (
        <div className="team-details">

            {/* ================= HERO ================= */}
            <header
                className="team-hero"
                style={{ backgroundImage: `url(${team.banner})` }}
            >
                <div className="team-hero-overlay">
                    <img src={team.logo} alt={team.name} className="team-logo-large" />
                    <h1>{team.name}</h1>
                    <p>{team.tagline}</p>
                </div>
            </header>

            {/* ================= QUICK STATS ================= */}
            <section className="team-quick-stats">
                <div><span>Founded</span><strong>{team.founded || '—'}</strong></div>
                <div><span>Home</span><strong>{team.homeGround || '—'}</strong></div>
                <div><span>Coach</span><strong>{team.coach || '—'}</strong></div>
                <div><span>Captain</span><strong>{team.captain || '—'}</strong></div>
            </section>

            {/* ================= SUB NAV ================= */}
            <nav className="team-subnav">
                {TABS.map(t => (
                    <Link
                        key={t.key}
                        to={`/teams/${teamId}/${t.key}`}
                        className={activeTab === t.key ? 'active' : ''}
                    >
                        {t.label}
                    </Link>
                ))}
            </nav>

            {/* ================= TAB CONTENT ================= */}
            <section className="team-tab-content">

                {activeTab === 'overview' && (
                    <section className="team-overview">
                        <div className="overview-grid">
                            <div>
                                <h3>Club Profile</h3>
                                <p>{team.description || 'Official club profile coming soon.'}</p>
                            </div>
                            <div>
                                <h3>Club Details</h3>
                                <ul className="club-meta">
                                    <li><strong>Founded:</strong> {team.founded || '—'}</li>
                                    <li><strong>Home Ground:</strong> {team.homeGround || '—'}</li>
                                    <li><strong>Colours:</strong> {team.colors.length ? team.colors.join(', ') : '—'}</li>
                                    <li><strong>Competition:</strong> PNG RFL</li>
                                </ul>
                            </div>
                        </div>
                    </section>
                )}

                {activeTab === 'squad' && (
                    team.players.length
                        ? <PlayersList players={team.players} />
                        : <p className="empty-state">Squad to be announced.</p>
                )}

                {activeTab === 'fixtures' && (
                    team.fixtures.length ? (
                        <table className="fixtures-table">
                            <thead>
                                <tr>
                                    <th>Round</th>
                                    <th>Opponent</th>
                                    <th>Venue</th>
                                    <th>Date</th>
                                    <th>Result</th>
                                </tr>
                            </thead>
                            <tbody>
                                {team.fixtures.map(f => (
                                    <tr key={f.id}>
                                        <td>{f.round}</td>
                                        <td>{f.opponent}</td>
                                        <td>{f.venue}</td>
                                        <td>{f.date}</td>
                                        <td>{f.result || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : <p className="empty-state">Fixtures coming soon.</p>
                )}

                {activeTab === 'ladder' && (
                    <p className="empty-state">Live ladder will appear during season.</p>
                )}

                {activeTab === 'honours' && (
                    team.honours.length
                        ? (
                            <ul className="honours-list">
                                {team.honours.map((h, i) => (
                                    <li key={i}><strong>{h.title}</strong> — {h.years}</li>
                                ))}
                            </ul>
                        )
                        : <p className="empty-state">No honours recorded.</p>
                )}

                {activeTab === 'staff' && (
                    team.staff.length
                        ? (
                            <div className="staff-grid">
                                {team.staff.map(s => (
                                    <article key={s.id} className="staff-card">
                                        <img src={s.photo} alt={s.name} />
                                        <h4>{s.name}</h4>
                                        <span>{s.role}</span>
                                    </article>
                                ))}
                            </div>
                        )
                        : <p className="empty-state">Staff profiles coming soon.</p>
                )}

                {activeTab === 'stats' && (
                    <section className="team-stats">
                        <div className="stats-grid">
                            <div><span>Played</span><strong>{team.stats.played || 0}</strong></div>
                            <div><span>Wins</span><strong>{team.stats.wins || 0}</strong></div>
                            <div><span>Losses</span><strong>{team.stats.losses || 0}</strong></div>
                            <div><span>Points For</span><strong>{team.stats.pointsFor || 0}</strong></div>
                            <div><span>Points Against</span><strong>{team.stats.pointsAgainst || 0}</strong></div>
                        </div>
                    </section>
                )}

            </section>

            {/* ================= ACTIONS ================= */}
            <div className="team-actions">
                <Link to="/teams" className="btn-outline">← Back to Teams</Link>
            </div>

        </div>
    )
}
