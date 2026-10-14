import { Link, useParams } from 'react-router-dom'
import { getFixtures, getLeagues, getTeams } from '../api/resources'
import { useApi } from '../hooks/useApi'
import RequestState from '../Components/ui/RequestState'
import './MatchDraw.css'

function normalize(value) {
    return String(value || '').trim().toLowerCase()
}

function isSameTeam(value, team) {
    return normalize(value) === normalize(team?.name) || normalize(value) === normalize(team?.id)
}

function getScore(fixture) {
    if (fixture.homeScore !== undefined && fixture.awayScore !== undefined) {
        return [Number(fixture.homeScore), Number(fixture.awayScore)]
    }
    const parts = String(fixture.score || '').match(/^\s*(\d+)\s*[-:]\s*(\d+)\s*$/)
    return parts ? [Number(parts[1]), Number(parts[2])] : null
}

function getTeamStats(team, fixtures) {
    return fixtures.reduce((stats, fixture) => {
        const score = getScore(fixture)
        const home = fixture.home || fixture.homeTeam
        const away = fixture.away || fixture.awayTeam
        if (!score || !team || (!isSameTeam(home, team) && !isSameTeam(away, team))) return stats
        const homeSide = isSameTeam(home, team)
        const forPoints = score[homeSide ? 0 : 1]
        const againstPoints = score[homeSide ? 1 : 0]
        stats.played += 1
        stats.pointsFor += forPoints
        stats.pointsAgainst += againstPoints
        if (forPoints > againstPoints) stats.wins += 1
        else if (forPoints < againstPoints) stats.losses += 1
        else stats.draws += 1
        return stats
    }, { played: 0, wins: 0, losses: 0, draws: 0, pointsFor: 0, pointsAgainst: 0 })
}

function getPlayerStats(player) {
    if (typeof player.stats === 'string') return player.stats
    if (!player.stats || typeof player.stats !== 'object') return ''
    return Object.entries(player.stats).map(([stat, value]) => `${stat}: ${value}`).join(' · ')
}

function getDrawStats(fixtures) {
    const teams = new Set()
    let completed = 0
    let draws = 0
    fixtures.forEach(fixture => {
        const home = fixture.home || fixture.homeTeam
        const away = fixture.away || fixture.awayTeam
        if (home) teams.add(home)
        if (away) teams.add(away)
        const score = getScore(fixture)
        if (score) {
            completed += 1
            if (score[0] === score[1]) draws += 1
        }
    })
    return { completed, scheduled: fixtures.length - completed, draws, teams: teams.size }
}

function MatchLineup({ heading, players, team }) {
    const starters = players.filter(player => !['in', 'out'].includes(normalize(player.movement)))
    const ins = players.filter(player => normalize(player.movement) === 'in')
    const outs = players.filter(player => normalize(player.movement) === 'out')

    return (
        <section className="match-draw-panel">
            <h2>{heading}</h2>
            {team && <Link to={`/teams/${team.id}/squad`}>View {team.name} squad</Link>}
            {players.length === 0 ? (
                <p className="match-draw-empty">Line-up to be announced.</p>
            ) : (
                <div className="match-lineup-groups">
                    {[['Starting line-up', starters], ['Ins', ins], ['Outs', outs]].map(([label, group]) => (
                        <section className="match-lineup-group" key={label}>
                            <h3>{label}</h3>
                            {group.length ? (
                                <ul>
                                    {group.map((player, index) => (
                                        <li key={player.id || `${player.name}-${index}`}>
                                            <div>
                                                <strong>{player.number ? `#${player.number} ` : ''}{player.name}</strong>
                                                {player.position && <span>{player.position}</span>}
                                            </div>
                                            {getPlayerStats(player) && <small>{getPlayerStats(player)}</small>}
                                        </li>
                                    ))}
                                </ul>
                            ) : <p className="match-draw-empty">None announced.</p>}
                        </section>
                    ))}
                </div>
            )}
        </section>
    )
}

export default function MatchDraw() {
    const { matchId } = useParams()
    const fixturesRequest = useApi(getFixtures, [])
    const teamsRequest = useApi(getTeams, [])
    const leaguesRequest = useApi(getLeagues, [])
    const match = fixturesRequest.data.find(fixture => String(fixture.id) === matchId)

    if (fixturesRequest.isLoading || teamsRequest.isLoading || leaguesRequest.isLoading) {
        return <main className="match-draw-page">
            <RequestState isLoading error={null} />
        </main>
    }
    if (fixturesRequest.error || teamsRequest.error || leaguesRequest.error) {
        const request = fixturesRequest.error ? fixturesRequest : teamsRequest.error ? teamsRequest : leaguesRequest
        return <main className="match-draw-page">
            <RequestState isLoading={false} error={request.error} onRetry={request.reload} />
        </main>
    }
    if (!match) {
        return <main className="match-draw-page"><p className="empty-state">Match draw not found.</p></main>
    }

    const homeTeam = teamsRequest.data.find(team => isSameTeam(match.home || match.homeTeam, team))
    const awayTeam = teamsRequest.data.find(team => isSameTeam(match.away || match.awayTeam, team))
    const league = leaguesRequest.data.find(item => String(item.id) === String(match.leagueId))
    const competitionFixtures = match.competition
        ? fixturesRequest.data.filter(item => normalize(item.competition) === normalize(match.competition))
        : []
    const leagueFixtures = league
        ? fixturesRequest.data.filter(item => String(item.leagueId || '') === String(league.id))
        : []
    const competitionStats = getDrawStats(competitionFixtures)
    const leagueStats = getDrawStats(leagueFixtures)
    const score = getScore(match)

    return (
        <main className="match-draw-page">
            <p className="eyebrow">Official draw</p>
            <h1>{match.home || match.homeTeam} <span>{score ? `${score[0]}–${score[1]}` : 'v'} </span>{match.away || match.awayTeam}</h1>
            <div className="match-draw-meta">
                <span>{match.competition || 'PNG RFL fixture'}</span>
                {match.round && <span>{match.round}</span>}
                {league && <span>{league.name}</span>}
                <span>{match.date || 'Date TBC'}{match.time ? ` · ${match.time}` : ''}</span>
                <span>Scheduled home ground: {match.venue || homeTeam?.homeGround || 'To be confirmed'}</span>
            </div>

            <section className="match-draw-panel">
                <h2>Teams and competition</h2>
                <div className="match-links">
                    {homeTeam && <Link to={`/teams/${homeTeam.id}/stats`}>{homeTeam.name} team stats</Link>}
                    {awayTeam && <Link to={`/teams/${awayTeam.id}/stats`}>{awayTeam.name} team stats</Link>}
                    {match.competition && <Link to={`/fixtures?competition=${encodeURIComponent(match.competition)}`}>All {match.competition} fixtures and stats</Link>}
                    {league && <Link to={`/fixtures?league=${encodeURIComponent(league.id)}`}>All {league.name} fixtures and stats</Link>}
                    {league && <Link to="/leagues">League profile and details</Link>}
                </div>
            </section>

            <section className="match-stat-grid" aria-label="Match statistics">
                {[
                    ['Competition draw', competitionStats, match.competition, 'competition'],
                    ['League draw', leagueStats, league?.name, 'league'],
                ].map(([label, stats, name, type]) => (
                    <article className="match-draw-panel" key={label}>
                        <h2>{label}</h2>
                        <strong>{stats.teams}</strong>
                        <span>teams · {stats.completed} completed · {stats.scheduled} scheduled · {stats.draws} draws</span>
                        {name && <Link to={type === 'league' ? `/fixtures?league=${encodeURIComponent(league.id)}` : `/fixtures?competition=${encodeURIComponent(name)}`}>View draw and stats</Link>}
                        {type === 'competition' && name && <Link to="/competitions">Competition details</Link>}
                    </article>
                ))}
                {[homeTeam, awayTeam].filter(Boolean).map(team => {
                    const stats = getTeamStats(team, fixturesRequest.data)
                    return (
                        <article className="match-draw-panel" key={team.id}>
                            <h2>{team.name} season stats</h2>
                            <p>{stats.played} played · {stats.wins} wins · {stats.draws} draws · {stats.losses} losses</p>
                            <p>Points for {stats.pointsFor} · against {stats.pointsAgainst}</p>
                            <Link to={`/teams/${team.id}/stats`}>Full team statistics</Link>
                        </article>
                    )
                })}
            </section>

            <div className="match-lineups">
                <MatchLineup heading={`${match.home || match.homeTeam} line-up`} players={match.homeLineup || []} team={homeTeam} />
                <MatchLineup heading={`${match.away || match.awayTeam} line-up`} players={match.awayLineup || []} team={awayTeam} />
            </div>
        </main>
    )
}
