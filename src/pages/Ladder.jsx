import { getLadder } from '../api/resources'
import { useApi } from '../hooks/useApi'
import RequestState from '../Components/ui/RequestState'

export default function Ladder() {
    const { data: ladder, isLoading, error, reload } = useApi(getLadder, [])

    return (
        <div className="page">
            <h1>PNG RFL Ladder</h1>

            <RequestState isLoading={isLoading} error={error} onRetry={reload} />

            {!isLoading && !error && ladder.length === 0 && <p className="empty-state">The ladder will appear when the season begins.</p>}
            {ladder.length > 0 && <table className="fixtures-table">
                <thead>
                    <tr>
                        <th>Pos</th>
                        <th>Team</th>
                        <th>Played</th>
                        <th>Points</th>
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
            </table>}
        </div>
    )
}
