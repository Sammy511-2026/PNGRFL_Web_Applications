import { getLeagues } from '../api/resources'
import { useApi } from '../hooks/useApi'
import RequestState from '../Components/ui/RequestState'

export default function Leagues() {
    const { data: leagues, isLoading, error, reload } = useApi(getLeagues, [])

    return (
        <main className="leagues-page">
            <h1>Provincial & Feeder Leagues</h1>
            <RequestState isLoading={isLoading} error={error} onRetry={reload} />

            {!isLoading && !error && leagues.length === 0 && <p className="empty-state">League information will be published soon.</p>}
            {leagues.map(league => (
                <section key={league.id} className="league-card">
                    <h2>{league.name}</h2>
                    {league.clubs.length > 0 ? (
                        <ul>
                            {league.clubs.map(club => <li key={club}>{club}</li>)}
                        </ul>
                    ) : (
                        <p>Club information will be published soon.</p>
                    )}
                </section>
            ))}
        </main>
    )
}