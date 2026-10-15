import { Link } from 'react-router-dom'
import { getLeagues } from '../api/resources'
import { useApi } from '../hooks/useApi'
import RequestState from '../Components/ui/RequestState'
import { getLeagueLocation, leagueFormats } from '../data/Leagues'
import './Leagues.css'

function getFormat(registration) {
    const value = `${registration.format || ''} ${registration.category || ''}`.toLowerCase()
    return leagueFormats.find(format => value.includes(format.id))?.label
        || registration.format
        || registration.category
        || ''
}

export default function Leagues() {
    const { data: leagues, isLoading, error, reload } = useApi(getLeagues, [])
    const registrations = leagues
        .map(league => {
            const location = getLeagueLocation(league)
            return {
                ...league,
                regionName: location.region?.name || league.region || '',
                provinceName: location.province?.name || league.province || '',
                formatName: getFormat(league),
            }
        })
        .sort((first, second) =>
            first.regionName.localeCompare(second.regionName)
            || first.provinceName.localeCompare(second.provinceName)
            || String(first.district || '').localeCompare(String(second.district || ''))
            || String(first.name || '').localeCompare(String(second.name || '')),
        )

    return (
        <main className="leagues-page">
            <header className="leagues-header">
                <p className="eyebrow">Find a competition</p>
                <h1>Provincial & District Leagues</h1>
                <p>Browse registered Rugby League 9s and 13s competitions by region, province, and district.</p>
            </header>
            <RequestState isLoading={isLoading} error={error} onRetry={reload} />

            {!isLoading && !error && (
                registrations.length ? (
                    <div className="league-table-wrap">
                        <table className="league-table">
                            <thead>
                                <tr>
                                    <th scope="col">Region</th>
                                    <th scope="col">Province / territory</th>
                                    <th scope="col">District</th>
                                    <th scope="col">Registered league</th>
                                    <th scope="col">Format</th>
                                </tr>
                            </thead>
                            <tbody>
                                {registrations.map((league, index) => (
                                    <tr key={league.id || `${league.name || 'league'}-${index}`}>
                                        <td data-label="Region">{league.regionName || '—'}</td>
                                        <td data-label="Province / territory">{league.provinceName || '—'}</td>
                                        <td data-label="District">{league.district || '—'}</td>
                                        <td data-label="Registered league">
                                            {league.id ? (
                                                <Link to={`/leagues/${encodeURIComponent(league.id)}`}>
                                                    {league.name || 'View league information'}
                                                </Link>
                                            ) : league.name || 'League registration'}
                                        </td>
                                        <td data-label="Format">{league.formatName || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="league-empty">No league registrations have been published.</p>
                )
            )}
        </main>
    )
}
