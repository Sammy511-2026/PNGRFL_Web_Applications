import { getTeams } from '../api/resources'
import TeamCard from '../Components/teams/TeamCard'
import { useApi } from '../hooks/useApi'
import RequestState from '../Components/ui/RequestState'
import './Teams.css'

export default function Teams() {
    const { data: teams, isLoading, error, reload } = useApi(getTeams, [])

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

            <RequestState isLoading={isLoading} error={error} onRetry={reload} />

            {/* ================= TEAMS GRID ================= */}
            {!isLoading && !error && teams.length === 0 && <p className="empty-state">No teams available.</p>}
            {teams.length > 0 && <section
                className="teams-grid"
                aria-label="PNG RFL Clubs"
            >
                {teams.map(team => (
                    <TeamCard
                        key={team.id}
                        team={team}
                    />
                ))}
            </section>}

        </main>
    )
}
