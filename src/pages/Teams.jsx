import { teams } from '../data/Teams'
import TeamCard from '../Components/teams/TeamCard'
import './Teams.css'

export default function Teams() {

    // Safety check (prevents crash if teams is undefined/null)
    if (!Array.isArray(teams) || teams.length === 0) {
        return (
            <main className="teams-page">
                <p className="empty-state">No teams available.</p>
            </main>
        )
    }

    return (
        <main className="teams-page">

            {/* ================= PAGE HEADER ================= */}
            <header className="teams-header">
                <h1>PNG Rugby Football League Clubs</h1>
                <p>
                    Discover the official clubs competing in the PNG Rugby Football League
                    national competition.
                </p>
            </header>

            {/* ================= TEAMS GRID ================= */}
            <section
                className="teams-grid"
                aria-label="PNG RFL Clubs"
            >
                {teams.map(team => (
                    <TeamCard
                        key={team.id}
                        team={team}
                    />
                ))}
            </section>

        </main>
    )
}
