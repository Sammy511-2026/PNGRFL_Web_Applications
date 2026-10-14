import FixtureSchedule from '../Components/fixtures/FixtureSchedule'
import { majorCompetitions } from '../data/Competitions'

export default function MatchCentre() {
    return (
        <main className="match-centre-page">
            <FixtureSchedule
                title="Draw"
                description="Choose a season, team, and round to follow the Digicel ExxonMobil Cup draw."
                defaultCompetition={majorCompetitions[0]}
            />
        </main>
    )
}
