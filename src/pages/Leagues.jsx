import { Link } from 'react-router-dom'
import { getLeagues } from '../api/resources'
import { useApi } from '../hooks/useApi'
import RequestState from '../Components/ui/RequestState'
import { leagueFormats, leagueRegions } from '../data/Leagues'
import './Leagues.css'

function matchesLocation(value, location) {
    if (!value) return false
    const normalizedValue = String(value).trim().toLowerCase()
    return normalizedValue === location.id || normalizedValue === location.name.toLowerCase()
}

function getFormat(registration) {
    const value = `${registration.format || ''} ${registration.category || ''}`.toLowerCase()
    return leagueFormats.find(format => value.includes(format.id))
}

function RegistrationDetails({ registration, format }) {
    const clubs = Array.isArray(registration.clubs)
        ? registration.clubs.join(', ')
        : registration.clubs || (registration.clubCount ? `${registration.clubCount} clubs` : '')
    const contact = registration.contactName || registration.contactPerson || registration.contact
    const details = [
        ['Season', registration.season],
        ['Registration status', registration.registrationStatus || registration.status],
        ['Clubs', clubs],
        ['Home venue', registration.venue || registration.homeGround],
        ['Contact', contact],
        ['Email', registration.contactEmail || registration.email],
        ['Phone', registration.contactPhone || registration.phone],
    ].filter(([, value]) => value)

    return (
        <article className="league-registration">
            <h4>{registration.name || format.label}</h4>
            <dl>
                {details.map(([label, value]) => (
                    <div key={label}>
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                    </div>
                ))}
            </dl>
            {registration.id && (
                <Link to={`/fixtures?league=${encodeURIComponent(registration.id)}`}>
                    View league draw and stats
                </Link>
            )}
        </article>
    )
}

function ProvinceLeagues({ province, region, leagues }) {
    const provinceLeagues = leagues.filter(league =>
        matchesLocation(league.region, region) && matchesLocation(league.province, province),
    )
    const provinceEntries = provinceLeagues.filter(league => !league.district)
    const districtNames = [...new Set(provinceLeagues.map(league => league.district).filter(Boolean))]

    function renderFormats(entries) {
        return leagueFormats.map(format => {
            const registrations = entries.filter(entry => getFormat(entry)?.id === format.id)
            return (
                <section className="league-format" key={format.id}>
                    <h4>{format.label}</h4>
                    {registrations.length ? (
                        <div className="league-registrations">
                            {registrations.map((registration, index) => (
                                <RegistrationDetails
                                    key={registration.id || `${format.id}-${index}`}
                                    registration={registration}
                                    format={format}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="league-empty">No registered {format.id} league published.</p>
                    )}
                </section>
            )
        })
    }

    return (
        <details className="league-province">
            <summary>{province.name}</summary>
            <div className="league-province-content">
                <div className="league-level">
                    <h3>Province registrations</h3>
                    {renderFormats(provinceEntries)}
                </div>
                <div className="league-districts">
                    <h3>District registrations</h3>
                    {districtNames.length ? districtNames.map(district => {
                        const districtEntries = provinceLeagues.filter(league => league.district === district)
                        return (
                            <section className="league-district" key={district}>
                                <h4>{district}</h4>
                                {renderFormats(districtEntries)}
                            </section>
                        )
                    }) : <p className="league-empty">District registrations will appear here when published.</p>}
                </div>
            </div>
        </details>
    )
}

export default function Leagues() {
    const { data: leagues, isLoading, error, reload } = useApi(getLeagues, [])

    return (
        <main className="leagues-page">
            <header className="leagues-header">
                <p className="eyebrow">Find a competition</p>
                <h1>Provincial & District Leagues</h1>
                <p>Browse registered Rugby League 9s and 13s competitions by region, province, and district.</p>
            </header>
            <RequestState isLoading={isLoading} error={error} onRetry={reload} />

            {!isLoading && !error && (
                <div className="league-regions">
                    {leagueRegions.map(region => (
                        <details className="league-region" key={region.id}>
                            <summary>
                                <span>{region.name}</span>
                                <span className="league-region-count">{region.provinces.length} provinces</span>
                            </summary>
                            <div className="league-region-provinces">
                                {region.provinces.map(province => (
                                    <ProvinceLeagues
                                        key={province.id}
                                        province={province}
                                        region={region}
                                        leagues={leagues}
                                    />
                                ))}
                            </div>
                        </details>
                    ))}
                </div>
            )}
        </main>
    )
}