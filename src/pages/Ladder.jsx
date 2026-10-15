import { getLadder, getTeams } from '../api/resources'
import { allCompetitions } from '../data/Competitions'
import { useApi } from '../hooks/useApi'
import RequestState from '../Components/ui/RequestState'
import { useSearchParams } from 'react-router-dom'
import './Ladder.css'

export default function Ladder() {
    const { data: ladder, isLoading, error, reload } = useApi(getLadder, [])
    const {
        data: teams,
        isLoading: teamsLoading,
        error: teamsError,
        reload: reloadTeams,
    } = useApi(getTeams, [])
    const [searchParams, setSearchParams] = useSearchParams()
    const requestedCompetition = searchParams.get('competition')
    const selectedCompetition = allCompetitions.includes(requestedCompetition)
        ? requestedCompetition
        : allCompetitions[0]
    const competitionTeams = teams.filter(team =>
        String(team.competition || '').trim().toLowerCase() === selectedCompetition.toLowerCase(),
    )
    const competitionTeamNames = new Set(competitionTeams.flatMap(team => [
        String(team.id).toLowerCase(),
        String(team.name).trim().toLowerCase(),
    ]))
    const competitionLadder = ladder.filter(row =>
        row.competition
            ? String(row.competition).trim().toLowerCase() === selectedCompetition.toLowerCase()
            : competitionTeamNames.has(String(row.team || row.name).trim().toLowerCase()),
    )

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
                        {allCompetitions.map(competition => (
                            <option key={competition} value={competition}>{competition}</option>
                        ))}
                    </select>
                </label>
            </header>

            <RequestState
                isLoading={isLoading || teamsLoading}
                error={error || teamsError}
                onRetry={() => {
                    reload()
                    reloadTeams()
                }}
            />

            {!isLoading && !teamsLoading && !error && !teamsError && competitionLadder.length === 0 && <p className="empty-state">The ladder will appear when standings are published.</p>}
            {!error && !teamsError && competitionLadder.length > 0 && <div className="ladder-table-wrap">
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
                        {competitionLadder.map(row => (
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
