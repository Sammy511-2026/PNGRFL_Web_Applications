import { useMemo } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getFixtures, getLadder, getTeams } from '../api/resources'
import FixtureSchedule from '../Components/fixtures/FixtureSchedule'
import TeamCard from '../Components/teams/TeamCard'
import RequestState from '../Components/ui/RequestState'
import { useApi } from '../hooks/useApi'
import { allCompetitions, getCompetitionSlug } from '../data/Competitions'
import './CompetitionPage.css'
import './Ladder.css'

const views = [
    { id: 'draw', label: 'Draw & Fixtures' },
    { id: 'ladder', label: 'Ladder' },
    { id: 'stats', label: 'Stats' },
]

function normalize(value) {
    return String(value || '').trim().toLowerCase()
}

function getFixtureScore(fixture) {
    if (fixture.homeScore !== undefined && fixture.awayScore !== undefined) {
        const score = [Number(fixture.homeScore), Number(fixture.awayScore)]
        return score.every(Number.isFinite) ? score : null
    }
    const parts = String(fixture.score || fixture.result || '').match(/^\s*(\d+)\s*[-:]\s*(\d+)\s*$/)
    return parts ? [Number(parts[1]), Number(parts[2])] : null
}

function buildTeamStats(team, fixtures) {
    const stats = { played: 0, wins: 0, losses: 0, draws: 0, pointsFor: 0, pointsAgainst: 0 }
    fixtures.forEach(fixture => {
        const score = getFixtureScore(fixture)
        if (!score) return
        const home = fixture.home || fixture.homeTeam
        const away = fixture.away || fixture.awayTeam
        const isHome = normalize(home) === normalize(team.name) || normalize(home) === normalize(team.id)
        const isAway = normalize(away) === normalize(team.name) || normalize(away) === normalize(team.id)
        if (!isHome && !isAway) return
        const pointsFor = score[isHome ? 0 : 1]
        const pointsAgainst = score[isHome ? 1 : 0]
        stats.played += 1
        stats.pointsFor += pointsFor
        stats.pointsAgainst += pointsAgainst
        if (pointsFor > pointsAgainst) stats.wins += 1
        else if (pointsFor < pointsAgainst) stats.losses += 1
        else stats.draws += 1
    })
    return stats
}

export default function CompetitionPage() {
    const { competitionSlug } = useParams()
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const competition = allCompetitions.find(item => getCompetitionSlug(item) === competitionSlug)
    const requestedView = searchParams.get('view')
    const activeView = views.some(view => view.id === requestedView) ? requestedView : 'draw'
    const teamsRequest = useApi(getTeams, [])
    const fixturesRequest = useApi(getFixtures, [])
    const ladderRequest = useApi(getLadder, [])

    const competitionTeams = useMemo(() => teamsRequest.data.filter(team =>
        normalize(team.competition) === normalize(competition),
    ), [competition, teamsRequest.data])
    const competitionFixtures = useMemo(() => fixturesRequest.data.filter(fixture =>
        normalize(fixture.competition) === normalize(competition),
    ), [competition, fixturesRequest.data])
    const teamStats = useMemo(() => competitionTeams.map(team => ({
        team,
        ...buildTeamStats(team, competitionFixtures),
    })), [competitionFixtures, competitionTeams])
    const ladderRows = useMemo(() => {
        const teamIds = new Set(competitionTeams.flatMap(team => [normalize(team.id), normalize(team.name)]))
        return ladderRequest.data.filter(row => {
            if (row.competition) return normalize(row.competition) === normalize(competition)
            return teamIds.has(normalize(row.team || row.name))
        })
    }, [competition, competitionTeams, ladderRequest.data])

    function selectCompetition(event) {
        navigate(`/competitions/${getCompetitionSlug(event.target.value)}?view=${activeView}`)
    }

    function selectView(view) {
        const nextParams = new URLSearchParams(searchParams)
        nextParams.set('view', view)
        setSearchParams(nextParams)
    }

    if (!competition) {
        return (
            <main className="competition-page">
                <h1>Competition not found</h1>
                <Link to="/">Return to home</Link>
            </main>
        )
    }

    return (
        <main className="competition-page page ladder-page">
            <header className="competition-heading">
                <div>
                    <p className="eyebrow">Major competition</p>
                    <h1>{competition}</h1>
                </div>
                <label className="ladder-competition-select">
                    <span>Competition</span>
                    <select value={competition} onChange={selectCompetition}>
                        {allCompetitions.map(item => (
                            <option key={item} value={item}>{item}</option>
                        ))}
                    </select>
                </label>
            </header>

            <nav className="competition-views" aria-label={`${competition} information`}>
                {views.map(view => (
                    <button
                        type="button"
                        key={view.id}
                        className={activeView === view.id ? 'is-active' : ''}
                        aria-current={activeView === view.id ? 'page' : undefined}
                        onClick={() => selectView(view.id)}
                    >
                        {view.label}
                    </button>
                ))}
            </nav>

            {activeView === 'draw' && (
                <FixtureSchedule
                    title="Draw & Fixtures"
                    description={`View the ${competition} draw, fixtures, and results.`}
                    defaultCompetition={competition}
                    showCompetitionFilter={false}
                    showTeamFilter={false}
                />
            )}

            {activeView === 'draw' && (
                <section className="competition-teams" aria-labelledby="competition-teams-title">
                    <h2 id="competition-teams-title">Teams</h2>
                    <RequestState
                        isLoading={teamsRequest.isLoading}
                        error={teamsRequest.error}
                        onRetry={teamsRequest.reload}
                    />
                    {!teamsRequest.isLoading && !teamsRequest.error && competitionTeams.length === 0 && (
                        <p className="empty-state">No teams have been added to this competition yet.</p>
                    )}
                    {!teamsRequest.error && competitionTeams.length > 0 && (
                        <div className="competition-teams-grid">
                            {competitionTeams.map(team => <TeamCard key={team.id} team={team} />)}
                        </div>
                    )}
                </section>
            )}

            {activeView === 'ladder' && (
                <section className="competition-data-section">
                    <h2>{competition} Ladder</h2>
                    <RequestState
                        isLoading={ladderRequest.isLoading || teamsRequest.isLoading}
                        error={ladderRequest.error || teamsRequest.error}
                        onRetry={() => {
                            ladderRequest.reload()
                            teamsRequest.reload()
                        }}
                    />
                    {!ladderRequest.isLoading && !teamsRequest.isLoading
                        && !ladderRequest.error && !teamsRequest.error && ladderRows.length === 0 && (
                        <p className="empty-state">The ladder will appear when standings are published.</p>
                    )}
                    {!ladderRequest.error && !teamsRequest.error && ladderRows.length > 0 && (
                        <div className="ladder-table-wrap">
                            <table className="fixtures-table ladder-table">
                                <thead>
                                    <tr>
                                        <th scope="col">Pos</th>
                                        <th scope="col">Team</th>
                                        <th scope="col">Played</th>
                                        <th scope="col">Wins</th>
                                        <th scope="col">Losses</th>
                                        <th scope="col">Points</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {ladderRows.map((row, index) => (
                                        <tr key={`${row.team || row.name}-${index}`}>
                                            <td>{row.position || index + 1}</td>
                                            <td>{row.team || row.name}</td>
                                            <td>{row.played ?? 0}</td>
                                            <td>{row.wins ?? 0}</td>
                                            <td>{row.losses ?? 0}</td>
                                            <td>{row.points ?? 0}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            )}

            {activeView === 'stats' && (
                <section className="competition-data-section">
                    <h2>{competition} Stats</h2>
                    <RequestState
                        isLoading={fixturesRequest.isLoading || teamsRequest.isLoading}
                        error={fixturesRequest.error || teamsRequest.error}
                        onRetry={() => {
                            fixturesRequest.reload()
                            teamsRequest.reload()
                        }}
                    />
                    {!fixturesRequest.isLoading && !fixturesRequest.error && (
                        <>
                            <div className="competition-summary-stats">
                                <div><span>Teams</span><strong>{competitionTeams.length}</strong></div>
                                <div><span>Fixtures</span><strong>{competitionFixtures.length}</strong></div>
                                <div><span>Completed</span><strong>{competitionFixtures.filter(getFixtureScore).length}</strong></div>
                                <div><span>Scheduled</span><strong>{competitionFixtures.filter(fixture => !getFixtureScore(fixture)).length}</strong></div>
                            </div>
                            {teamStats.length > 0 && (
                                <div className="ladder-table-wrap">
                                    <table className="fixtures-table ladder-table">
                                        <thead>
                                            <tr>
                                                <th scope="col">Team</th>
                                                <th scope="col">Played</th>
                                                <th scope="col">Wins</th>
                                                <th scope="col">Draws</th>
                                                <th scope="col">Losses</th>
                                                <th scope="col">Points For</th>
                                                <th scope="col">Points Against</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {teamStats.map(({ team, ...stats }) => (
                                                <tr key={team.id}>
                                                    <td>{team.name}</td>
                                                    <td>{stats.played}</td>
                                                    <td>{stats.wins}</td>
                                                    <td>{stats.draws}</td>
                                                    <td>{stats.losses}</td>
                                                    <td>{stats.pointsFor}</td>
                                                    <td>{stats.pointsAgainst}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    )}
                </section>
            )}
        </main>
    )
}
