import { Link } from 'react-router-dom'
import './TeamCard.css'

export default function TeamCard({ team }) {

    // Defensive guard (prevents crashes)
    if (!team) return null

    return (
        <article className="team-card">

            <Link
                to={`/teams/${team.id}`}
                className="team-card-link"
                aria-label={`View ${team.name} details`}
            >
                {/* Team Logo */}
                <div className="team-card-logo">
                    <img
                        src={team.logo}
                        alt={`${team.name} logo`}
                        loading="lazy"
                    />
                </div>

                {/* Team Info */}
                <div className="team-card-info">
                    <h3>{team.name}</h3>

                    {team.homeGround && (
                        <p className="team-card-meta">
                            {team.homeGround}
                        </p>
                    )}
                </div>
            </Link>

        </article>
    )
}
