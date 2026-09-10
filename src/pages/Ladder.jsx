import { useEffect, useState } from 'react'
import { getLadder } from '../api/teamsApi'

export default function Ladder() {
    const [ladder, setLadder] = useState([])

    useEffect(() => {
        getLadder().then(setLadder)
    }, [])

    return (
        <div className="page">
            <h1>PNG RFL Ladder</h1>

            <table className="fixtures-table">
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
            </table>
        </div>
    )
}
