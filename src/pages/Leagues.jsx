import { leagues } from '../data/Leagues'

export default function Leagues() {
    return (
        <main className="leagues-page">
            <h1>Provincial & Feeder Leagues</h1>

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