import { getLadder } from '../api/resources'
import { majorCompetitions } from '../data/Competitions'
import { useApi } from '../hooks/useApi'
import RequestState from '../Components/ui/RequestState'
import { useSearchParams } from 'react-router-dom'
import './Ladder.css'

export default function Ladder() {
    const { data: ladder, isLoading, error, reload } = useApi(getLadder, [])
    const [searchParams, setSearchParams] = useSearchParams()
    const requestedCompetition = searchParams.get('competition')
    const selectedCompetition = majorCompetitions.includes(requestedCompetition)
        ? requestedCompetition
        : majorCompetitions[0]

    function selectCompetition(event) {
        const nextParams = new URLSearchParams(searchParams)
        nextParams.set('competition', event.target.value)
        setSearchParams(nextParams)
    }

    return (
        <div className="page ladder-page">
            <header className="ladder-heading">
                <div>
                    <p className="eyebrow">Major Competitions</p>
                    <h1>{selectedCompetition} Ladder</h1>
                </div>
                <label className="ladder-competition-select">
                    <span>Major Competition</span>
                    <select value={selectedCompetition} onChange={selectCompetition}>
                        {majorCompetitions.map(competition => (
                            <option key={competition} value={competition}>{competition}</option>
                        ))}
                    </select>
                </label>
            </header>

            <RequestState isLoading={isLoading} error={error} onRetry={reload} />

            {!isLoading && !error && ladder.length === 0 && <p className="empty-state">The ladder will appear when the season begins.</p>}
            {ladder.length > 0 && <div className="ladder-table-wrap">
                <table className="fixtures-table ladder-table">
                    <thead>
                        <tr>
                            <th scope="col">Pos</th>
                            <th scope="col">Team</th>
                            <th scope="col">Played</th>
                            <th scope="col">Points</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ladder.map(row => (
                            <tr key={row.position}>
                                <td>{row.position}</td>
                                <td>{row.team}</td>
                                <td>{row.played}</td>
                                <td>{row.points}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>}
        </div>
    )
}
