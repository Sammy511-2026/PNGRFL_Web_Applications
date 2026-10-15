import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getFixtures, getLeagues, getTeams } from '../../api/resources'
import { allCompetitions } from '../../data/Competitions'
import { useApi } from '../../hooks/useApi'
import RequestState from '../ui/RequestState'
import FixtureCard from './FixtureCard'
import './FixtureSchedule.css'

function normalize(value) {
    return String(value || '').trim().toLocaleLowerCase()
}

function getSeason(fixture) {
    return String(fixture.season || fixture.date?.slice(0, 4) || '')
}

function escapeCalendarText(value) {
    return String(value || '').replace(/\\/g, '\\\\').replace(/,/g, '\\,').replace(/;/g, '\\;').replace(/\n/g, '\\n')
}

function calendarDate(date, time) {
    const day = String(date || '').replace(/-/g, '')
    if (!day) return ''
    const clock = String(time || '00:00').replace(/:/g, '').slice(0, 4)
    return `${day}T${clock}00`
}

export default function FixtureSchedule({
    title = 'Fixtures & Results',
    description = 'Official PNG Rugby Football League match schedule and results.',
    defaultCompetition = '',
    showCompetitionFilter = true,
    showTeamFilter = true,
}) {
    const fixturesRequest = useApi(getFixtures, [])
    const teamsRequest = useApi(getTeams, [])
    const leaguesRequest = useApi(getLeagues, [])
    const [searchParams, setSearchParams] = useSearchParams()
    const selectedCompetition = searchParams.get('competition') || ''
    const selectedLeague = searchParams.get('league') || ''
    const selectedTeam = showTeamFilter ? searchParams.get('team') || '' : ''
    const selectedSeason = searchParams.get('season') || ''
    const selectedRound = searchParams.get('round') || ''

    const competitions = useMemo(() => [
        ...allCompetitions.map(name => ({ value: name, label: name })),
        ...leaguesRequest.data.map(league => ({ value: `league:${league.id}`, label: league.name })),
    ], [leaguesRequest.data])

    const activeCompetition = selectedCompetition === 'all'
        ? ''
        : selectedCompetition || defaultCompetition

    const competitionFixtures = useMemo(() => fixturesRequest.data.filter(fixture => {
        if (activeCompetition.startsWith('league:')) {
            return String(fixture.leagueId || '') === activeCompetition.slice('league:'.length)
        }
        return !activeCompetition || normalize(fixture.competition) === normalize(activeCompetition)
    }), [activeCompetition, fixturesRequest.data])
    const availableTeams = showCompetitionFilter || !activeCompetition || activeCompetition.startsWith('league:')
        ? teamsRequest.data
        : teamsRequest.data.filter(team => normalize(team.competition) === normalize(activeCompetition))
    const seasons = useMemo(() => {
        const years = [...new Set(competitionFixtures.map(getSeason).filter(Boolean))]
        if (!years.length) years.push(String(new Date().getFullYear()))
        return years.sort((a, b) => b.localeCompare(a))
    }, [competitionFixtures])
    const activeSeason = selectedSeason || seasons[0] || ''

    function updateParams(changes) {
        const nextParams = new URLSearchParams(searchParams)
        Object.entries(changes).forEach(([key, value]) => {
            if (value) nextParams.set(key, value)
            else nextParams.delete(key)
        })
        setSearchParams(nextParams)
    }

    const filteredFixtures = useMemo(() => fixturesRequest.data.filter(fixture => {
        const fixtureCompetition = normalize(fixture.competition)
        const fixtureLeague = String(fixture.leagueId || '')
        const selectedLeagueId = activeCompetition.startsWith('league:')
            ? activeCompetition.slice('league:'.length)
            : selectedLeague
        const selectedCompetitionName = activeCompetition.startsWith('league:')
            ? ''
            : activeCompetition

        if (selectedCompetitionName && fixtureCompetition !== normalize(selectedCompetitionName)) return false
        if (selectedLeagueId && fixtureLeague !== selectedLeagueId) return false
        if (activeSeason && getSeason(fixture) !== activeSeason) return false
        if (selectedTeam) {
            const team = teamsRequest.data.find(item => String(item.id) === selectedTeam)
            const teamValues = [fixture.home, fixture.away, fixture.homeTeam, fixture.awayTeam]
            if (!teamValues.some(value =>
                normalize(value) === normalize(team?.name) || normalize(value) === normalize(team?.id),
            )) return false
        }
        if (selectedRound && String(fixture.round || '') !== selectedRound) return false
        return true
    }), [activeCompetition, activeSeason, fixturesRequest.data, selectedLeague, selectedRound, selectedTeam, teamsRequest.data])
    const calendarFixtures = filteredFixtures.filter(fixture => /^\d{4}-\d{2}-\d{2}$/.test(fixture.date || ''))

    const rounds = useMemo(() => {
        const values = [...new Set(fixturesRequest.data
            .filter(fixture => {
                const competitionValue = activeCompetition.startsWith('league:')
                    ? ''
                    : activeCompetition
                const leagueId = activeCompetition.startsWith('league:')
                    ? activeCompetition.slice('league:'.length)
                    : selectedLeague
                if (competitionValue && normalize(fixture.competition) !== normalize(competitionValue)) return false
                if (leagueId && String(fixture.leagueId || '') !== leagueId) return false
                if (activeSeason && getSeason(fixture) !== activeSeason) return false
                return true
            })
            .map(fixture => String(fixture.round || '').trim())
            .filter(Boolean))]
        return values.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    }, [activeCompetition, activeSeason, fixturesRequest.data, selectedLeague])

    function moveRound(direction) {
        if (!rounds.length) return
        const currentIndex = rounds.indexOf(selectedRound)
        const nextIndex = currentIndex < 0
            ? direction > 0 ? 0 : rounds.length - 1
            : (currentIndex + direction + rounds.length) % rounds.length
        updateParams({ round: rounds[nextIndex] })
    }

    function addToCalendar() {
        const events = calendarFixtures.map(fixture => {
            const start = calendarDate(fixture.date, fixture.time)
            const startDate = new Date(`${fixture.date}T${fixture.time || '00:00'}:00`)
            startDate.setHours(startDate.getHours() + 2)
            const end = calendarDate(
                `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`,
                `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`,
            )
            return [
                'BEGIN:VEVENT',
                `UID:${escapeCalendarText(fixture.id)}@pngrfl`,
                `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
                `DTSTART:${start}`,
                `DTEND:${end}`,
                `SUMMARY:${escapeCalendarText(`${fixture.home || fixture.homeTeam} vs ${fixture.away || fixture.awayTeam}`)}`,
                `DESCRIPTION:${escapeCalendarText([fixture.competition, fixture.round].filter(Boolean).join(' · '))}`,
                `LOCATION:${escapeCalendarText(fixture.venue)}`,
                'END:VEVENT',
            ].join('\r\n')
        })
        const calendar = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//PNG RFL//Draw//EN', ...events, 'END:VCALENDAR'].join('\r\n')
        const fileUrl = URL.createObjectURL(new Blob([calendar], { type: 'text/calendar;charset=utf-8' }))
        const link = document.createElement('a')
        link.href = fileUrl
        link.download = 'png-rfl-draw.ics'
        link.click()
        URL.revokeObjectURL(fileUrl)
    }

    return (
        <section className="fixture-schedule" aria-labelledby="fixture-schedule-title">
            <header className="fixture-schedule-heading">
                <h1 id="fixture-schedule-title">{title}<span aria-hidden="true"> /</span></h1>
                <p>{description}</p>
            </header>

            <div className="fixture-schedule-content">
                <div className="fixture-filters" aria-label="Filter draw">
                    {showCompetitionFilter && (
                        <label className="fixture-filter-control">
                            <span className="visually-hidden">Competition</span>
                            <select
                                aria-label="Competition"
                                value={selectedCompetition === 'all'
                                    ? ''
                                    : selectedCompetition || (selectedLeague ? `league:${selectedLeague}` : defaultCompetition)}
                                onChange={event => {
                                    const value = event.target.value
                                    updateParams({
                                        competition: value.startsWith('league:')
                                            ? ''
                                            : value || (defaultCompetition ? 'all' : ''),
                                        league: value.startsWith('league:') ? value.slice('league:'.length) : '',
                                        team: '',
                                        round: '',
                                    })
                                }}
                            >
                                <option value="">All Competitions</option>
                                {competitions.map(competition => (
                                    <option key={competition.value} value={competition.value}>{competition.label}</option>
                                ))}
                            </select>
                        </label>
                    )}

                    <label className="fixture-filter-control">
                        <span className="visually-hidden">Season</span>
                        <select
                            aria-label="Season"
                            value={activeSeason}
                            onChange={event => updateParams({ season: event.target.value, round: '' })}
                        >
                            {seasons.map(season => <option key={season} value={season}>{season}</option>)}
                        </select>
                    </label>

                    {showTeamFilter && (
                        <label className="fixture-filter-control">
                            <span className="visually-hidden">Team</span>
                            <select
                                aria-label="Team"
                                value={selectedTeam}
                                onChange={event => updateParams({ team: event.target.value })}
                            >
                                <option value="">All Teams</option>
                                {availableTeams.map(team => (
                                    <option key={team.id} value={team.id}>{team.name}</option>
                                ))}
                            </select>
                        </label>
                    )}

                    <div className="fixture-round-control" aria-label="Select round">
                        <button type="button" aria-label="Previous round" disabled={!rounds.length} onClick={() => moveRound(-1)}>‹</button>
                        <select
                            aria-label="Round"
                            value={selectedRound}
                            onChange={event => updateParams({ round: event.target.value })}
                        >
                            <option value="">All Rounds</option>
                            {rounds.map(round => <option key={round} value={round}>{round}</option>)}
                        </select>
                        <button type="button" aria-label="Next round" disabled={!rounds.length} onClick={() => moveRound(1)}>›</button>
                    </div>

                    <button className="fixture-calendar-button" type="button" onClick={addToCalendar} disabled={!calendarFixtures.length}>
                        Add To Calendar
                    </button>
                </div>

                <RequestState isLoading={fixturesRequest.isLoading} error={fixturesRequest.error} onRetry={fixturesRequest.reload} />
                <RequestState isLoading={teamsRequest.isLoading} error={teamsRequest.error} onRetry={teamsRequest.reload} />
                <RequestState isLoading={leaguesRequest.isLoading} error={leaguesRequest.error} onRetry={leaguesRequest.reload} />

                {!fixturesRequest.isLoading && !fixturesRequest.error && (
                    filteredFixtures.length
                        ? <div className="fixtures-list" aria-live="polite">
                            {filteredFixtures.map(match => {
                                const homeTeam = teamsRequest.data.find(team =>
                                    normalize(team.name) === normalize(match.home || match.homeTeam)
                                    || normalize(team.id) === normalize(match.home || match.homeTeam),
                                )
                                const awayTeam = teamsRequest.data.find(team =>
                                    normalize(team.name) === normalize(match.away || match.awayTeam)
                                    || normalize(team.id) === normalize(match.away || match.awayTeam),
                                )
                                return <FixtureCard key={match.id} match={match} homeTeam={homeTeam} awayTeam={awayTeam} />
                            })}
                        </div>
                        : <p className="empty-state">No fixtures are available for these draw filters.</p>
                )}
            </div>
        </section>
    )
}
