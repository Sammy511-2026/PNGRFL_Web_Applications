import { fixtures } from '../data/Fixtures'
import FixtureCard from '../Components/fixtures/FixtureCard'
import './Fixtures.css'

export default function Fixtures() {

    // Defensive guard (API-ready)
    if (!Array.isArray(fixtures) || fixtures.length === 0) {
        return (
            <main className="fixtures-page">
                <h1>Fixtures & Results</h1>
                <p className="empty-state">Fixtures will be published soon.</p>
            </main>
        )
    }

    return (
        <main className="fixtures-page">


            <header className="fixtures-header">
                <h1>Fixtures & Results</h1>
                <p>
                    Official PNG Rugby Football League match schedule and results.
                </p>
            </header>

            {/* ================= FIXTURES LIST ================= */}
            <section className="fixtures-list" aria-label="PNG RFL Fixtures">
                {fixtures.map(match => (
                    <FixtureCard
                        key={match.id}
                        match={match}
                    />
                ))}
            </section>

        </main>
    )
}
