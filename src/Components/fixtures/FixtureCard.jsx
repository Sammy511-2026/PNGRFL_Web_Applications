import { Link } from 'react-router-dom'
import './FixtureCard.css'

function formatMatchDate(date) {
    if (!date) return 'Date to be confirmed'
    const parsedDate = new Date(`${date}T12:00:00`)
    if (Number.isNaN(parsedDate.getTime())) return date
    return parsedDate.toLocaleDateString('en-AU', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    }).toUpperCase()
}

function TeamBadge({ team, name }) {
    return (
        <div className="fixture-team-badge">
            {team?.logo
                ? <img src={team.logo} alt="" />
                : <span aria-hidden="true">{String(name || '?').slice(0, 2).toUpperCase()}</span>}
        </div>
    )
}

export default function FixtureCard({ match, homeTeam, awayTeam }) {
    const hasResult = Boolean(match.score)
    const status = hasResult ? 'Full time' : match.status === 'live' ? 'Live' : 'Scheduled'

    return (
        <article className="fixture-card">
            <div className="fixture-card-date">{formatMatchDate(match.date)}</div>

            <div className="fixture-card-match">
                <div className="fixture-card-team fixture-card-home">
                    <div>
                        <strong>{match.home || match.homeTeam}</strong>
                        {homeTeam?.province && <span>{homeTeam.province}</span>}
                    </div>
                    <TeamBadge team={homeTeam} name={match.home || match.homeTeam} />
                </div>

                <div className="fixture-card-score">
                    <strong>{match.score || 'vs'}</strong>
                    {hasResult && <span>{status}</span>}
                    {!hasResult && match.time && <span>{match.time}</span>}
                </div>

                <div className="fixture-card-team fixture-card-away">
                    <TeamBadge team={awayTeam} name={match.away || match.awayTeam} />
                    <div>
                        <strong>{match.away || match.awayTeam}</strong>
                        {awayTeam?.province && <span>{awayTeam.province}</span>}
                    </div>
                </div>
            </div>

            <div className="fixture-card-venue">
                <span>{match.venue || homeTeam?.homeGround || 'Ground to be confirmed'}</span>
                {match.competition && <span>{match.competition}</span>}
                {match.round && <span>{match.round}</span>}
            </div>

            <div className="fixture-card-actions">
                <Link to={`/matches/${match.id}`}>Match draw, squads & stats</Link>
            </div>
        </article>
    )
}
