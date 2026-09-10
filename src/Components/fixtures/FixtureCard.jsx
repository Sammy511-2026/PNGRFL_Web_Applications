import './FixtureCard.css'

export default function FixtureCard({ match }) {
    return (
        <div className="fixture-card">
            <div className="fixture-round">{match.round}</div>

            <div className="fixture-teams">
                <strong>{match.home}</strong>
                <span>vs</span>
                <strong>{match.away}</strong>
            </div>

            <div className="fixture-meta">
                <span>{match.venue}</span>
                <span>{match.date} • {match.time}</span>
            </div>

            {match.score && (
                <div className="fixture-score">{match.score}</div>
            )}
        </div>
    )
}
