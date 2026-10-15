import { Link, useParams } from 'react-router-dom'
import { getLeagues } from '../api/resources'
import RequestState from '../Components/ui/RequestState'
import { getLeagueLocation, leagueFormats } from '../data/Leagues'
import { useApi } from '../hooks/useApi'
import './Leagues.css'

function getFormat(registration) {
    const value = `${registration.format || ''} ${registration.category || ''}`.toLowerCase()
    return leagueFormats.find(format => value.includes(format.id))?.label || registration.format || registration.category
}

function listValue(value) {
    if (Array.isArray(value)) return value.join(', ')
    return value
}

export default function LeagueDetails() {
    const { leagueId } = useParams()
    const { data: leagues, isLoading, error, reload } = useApi(getLeagues, [])
    const league = leagues.find(item => String(item.id) === String(leagueId))
    const { region, province } = league ? getLeagueLocation(league) : {}
    const fields = league ? [
        ['Competition', league.name],
        ['Format', getFormat(league)],
        ['Region', region?.name || league.region],
        ['Province / territory', province?.name || league.province],
        ['District', league.district],
        ['Season', league.season],
        ['Registration status', league.registrationStatus || league.status],
        ['Registered clubs', listValue(league.clubs) || (league.clubCount ? `${league.clubCount} clubs` : '')],
        ['Home venue', league.venue || league.homeGround],
        ['Contact name', league.contactName || league.contactPerson || league.contact],
        ['Contact email', league.contactEmail || league.email],
        ['Contact phone', league.contactPhone || league.phone],
    ].filter(([, value]) => value) : []

    return (
        <main className="leagues-page league-details-page">
            <Link className="league-back-link" to="/leagues">← All leagues</Link>
            <RequestState isLoading={isLoading} error={error} onRetry={reload} />
            {!isLoading && !error && !league && <p className="league-empty">League registration not found.</p>}
            {!isLoading && !error && league && (
                <>
                    <header className="leagues-header">
                        <p className="eyebrow">
                            {[region?.name || league.region, province?.name || league.province, league.district]
                                .filter(Boolean)
                                .join(' / ')}
                        </p>
                        <h1>{league.name || getFormat(league) || 'League registration'}</h1>
                    </header>

                    <section className="league-detail-card" aria-label="League information">
                        <h2>League information</h2>
                        <div className="league-detail-table-wrap">
                            <table className="league-detail-table">
                                <tbody>
                                    {fields.map(([label, value]) => (
                                        <tr key={label}>
                                            <th scope="row">{label}</th>
                                            <td>{value}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {league.id && (
                            <Link to={`/fixtures?league=${encodeURIComponent(league.id)}`}>
                                View league draw and stats
                            </Link>
                        )}
                    </section>
                </>
            )}
        </main>
    )
}
