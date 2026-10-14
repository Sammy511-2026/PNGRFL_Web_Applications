import { useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getFixtures, getLadder, getTeamById } from '../api/resources'
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

function belongsToTeam(value, team) {
    if (!value || !team) return false
    const normalized = String(value).trim().toLowerCase()
    return normalized === String(team.id).toLowerCase() || normalized === team.name.trim().toLowerCase()
}

function getScore(match) {
    if (match.homeScore !== undefined && match.awayScore !== undefined) {
        const scores = [Number(match.homeScore), Number(match.awayScore)]
        return scores.every(Number.isFinite) ? scores : null
    }
    const parts = String(match.score || match.result || '').match(/^\s*(\d+)\s*[-:]\s*(\d+)\s*$/)
    return parts ? [Number(parts[1]), Number(parts[2])] : null
}

function getTeamStats(team, fixtures) {
    const stats = { played: 0, wins: 0, losses: 0, draws: 0, pointsFor: 0, pointsAgainst: 0 }
    fixtures.forEach(match => {
        const score = getScore(match)
        if (!score) return
        const isHome = belongsToTeam(match.home || match.homeTeam, team)
        const pointsFor = score[isHome ? 0 : 1]
        const pointsAgainst = score[isHome ? 1 : 0]
        stats.played += 1
        stats.pointsFor += pointsFor
        stats.pointsAgainst += pointsAgainst
        if (pointsFor > pointsAgainst) stats.wins += 1
        else if (pointsFor < pointsAgainst) stats.losses += 1
        else stats.draws += 1
    })

    const savedStats = team.stats || {}
    return Object.fromEntries(Object.keys(stats).map(key => [
        key,
        stats.played ? stats[key] : Number(savedStats[key]) || 0,
    ]))
}

export default function TeamDetails() {
    const { teamId, tab } = useParams()
    const navigate = useNavigate()
    const loadTeam = useCallback(() => getTeamById(teamId), [teamId])
    const { data: rawTeam, isLoading, error, reload } = useApi(loadTeam, null)
    const { data: allFixtures = [] } = useApi(getFixtures, [])
    const { data: ladder = [] } = useApi(getLadder, [])

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
        region: '',
        province: '',
        district: '',
        ...rawTeam
    }
    const teamMatches = allFixtures.filter(match =>
        belongsToTeam(match.home || match.homeTeam, team) || belongsToTeam(match.away || match.awayTeam, team),
    )
    const fixtures = teamMatches.length ? teamMatches.map(match => {
        const isHome = belongsToTeam(match.home || match.homeTeam, team)
        const score = getScore(match)
        return {
            ...match,
            opponent: isHome ? match.away || match.awayTeam : match.home || match.homeTeam,
            result: match.result || (score ? `${score[isHome ? 0 : 1]}-${score[isHome ? 1 : 0]}` : ''),
        }
    }) : team.fixtures
    const stats = getTeamStats(team, teamMatches)
    const ladderRow = ladder.find(row => belongsToTeam(row.team || row.name, team))

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
                                    <li><strong>Colours:</strong> {Array.isArray(team.colors) && team.colors.length ? team.colors.join(', ') : '—'}</li>
                                    <li><strong>Competition:</strong> {team.competition || 'PNG RFL'}</li>
                                    {team.region && <li><strong>Region:</strong> {team.region}</li>}
                                    {team.province && <li><strong>Province:</strong> {team.province}</li>}
                                    {team.district && <li><strong>District:</strong> {team.district}</li>}
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
                    fixtures.length ? (
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
                                {fixtures.map(f => (
                                    <tr key={f.id}>
                                        <td>{f.round}</td>
                                        <td>{f.opponent || '—'}</td>
                                        <td>{f.venue}</td>
                                        <td>{f.date}</td>
                                        <td>{f.result || f.status || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : <p className="empty-state">Fixtures coming soon.</p>
                )}

                {activeTab === 'ladder' && (
                    ladderRow ? (
                        <table className="fixtures-table">
                            <thead><tr><th>Pos</th><th>Club</th><th>Played</th><th>Wins</th><th>Points</th></tr></thead>
                            <tbody><tr>
                                <td>{ladderRow.position || '—'}</td>
                                <td>{ladderRow.team || ladderRow.name}</td>
                                <td>{ladderRow.played ?? 0}</td>
                                <td>{ladderRow.wins ?? 0}</td>
                                <td>{ladderRow.points ?? 0}</td>
                            </tr></tbody>
                        </table>
                    ) : <p className="empty-state">Live ladder will appear when standings are published.</p>
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
                                        {s.photo && <img src={s.photo} alt={`${s.name} profile`} />}
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
                            <div><span>Played</span><strong>{stats.played}</strong></div>
                            <div><span>Wins</span><strong>{stats.wins}</strong></div>
                            <div><span>Losses</span><strong>{stats.losses}</strong></div>
                            <div><span>Draws</span><strong>{stats.draws}</strong></div>
                            <div><span>Points For</span><strong>{stats.pointsFor}</strong></div>
                            <div><span>Points Against</span><strong>{stats.pointsAgainst}</strong></div>
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
