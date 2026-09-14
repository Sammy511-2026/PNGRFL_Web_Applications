import { getFixtures } from '../api/resources'
import FixtureCard from '../Components/fixtures/FixtureCard'
import { useApi } from '../hooks/useApi'
import RequestState from '../Components/ui/RequestState'
import './Fixtures.css'

export default function Fixtures() {
    const { data: fixtures, isLoading, error, reload } = useApi(getFixtures, [])

    return (
        <main className="fixtures-page">


            <header className="fixtures-header">
                <h1>Fixtures & Results</h1>
                <p>
                    Official PNG Rugby Football League match schedule and results.
                </p>
            </header>

            <RequestState isLoading={isLoading} error={error} onRetry={reload} />
            {!isLoading && !error && fixtures.length === 0 && <p className="empty-state">Fixtures will be published soon.</p>}

            {/* ================= FIXTURES LIST ================= */}
            {fixtures.length > 0 && <section className="fixtures-list" aria-label="PNG RFL Fixtures">
                {fixtures.map(match => (
                    <FixtureCard
                        key={match.id}
                        match={match}
                    />
                ))}
            </section>}

        </main>
    )
}
