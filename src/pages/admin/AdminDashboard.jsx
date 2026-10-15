import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clearAuthSession, getAuthToken, getAuthUser, USE_MOCK_DATA } from '../../api/client'
import { createAdminAccount, createResource, getFixtures, getLeagues, getTeams, updateResource } from '../../api/resources'
import { useApi } from '../../hooks/useApi'
import RequestState from '../../Components/ui/RequestState'
import { getLeagueLocation, leagueFormats, leagueRegions } from '../../data/Leagues'
import { allCompetitions } from '../../data/Competitions'
import './Admin.css'

function findRegion(value) {
    if (!value) return null
    return leagueRegions.find(region =>
        region.id === String(value).toLowerCase() || region.name.toLowerCase() === String(value).toLowerCase(),
    ) || null
}

function findProvince(region, value) {
    if (!region || !value) return null
    return region.provinces.find(province =>
        province.id === String(value).toLowerCase() || province.name.toLowerCase() === String(value).toLowerCase(),
    ) || null
}

function loadNoRecords() {
    return Promise.resolve([])
}

function parseRows(value, fields) {
    return value.split('\n').map(line => line.trim()).filter(Boolean).map((line, index) =>
        fields(line.split('|').map(part => part.trim()), index),
    )
}

function parseLineup(value, side) {
    return parseRows(value, ([name, position, number, movement, stats], index) => ({
        id: `${side}-player-${index + 1}`,
        name,
        position,
        number,
        movement: movement?.toLowerCase() || 'starter',
        stats: stats || '',
    }))
}

export default function AdminDashboard() {
    const navigate = useNavigate()
    const user = getAuthUser()
    const role = user?.role
    const isSuperAdmin = role === 'super-admin' || role === 'admin'
    const isRegionAdmin = role === 'region-admin' || role === 'regional-admin'
    const isProvinceAdmin = role === 'province-admin' || role === 'provincial-admin'
    const assignedRegion = findRegion(user?.region)
    const assignedProvince = findProvince(assignedRegion, user?.province)
    const hasLeagueScope = isSuperAdmin || (isRegionAdmin && assignedRegion) || (isProvinceAdmin && assignedRegion && assignedProvince)
    const teamsRequest = useApi(isSuperAdmin ? getTeams : loadNoRecords, [])
    const fixturesRequest = useApi(isSuperAdmin ? getFixtures : loadNoRecords, [])
    const leaguesRequest = useApi(getLeagues, [])
    const [activeResource, setActiveResource] = useState(isSuperAdmin ? 'team' : 'league')
    const [notice, setNotice] = useState('')
    const [isSaving, setIsSaving] = useState(false)
    const [selectedLeagueRegion, setSelectedLeagueRegion] = useState(assignedRegion?.id || leagueRegions[0].id)
    const [selectedLeagueProvince, setSelectedLeagueProvince] = useState(assignedProvince?.id || assignedRegion?.provinces[0].id || leagueRegions[0].provinces[0].id)
    const [adminRole, setAdminRole] = useState('region-admin')
    const [selectedAdminRegion, setSelectedAdminRegion] = useState(leagueRegions[0].id)
    const [selectedAdminProvince, setSelectedAdminProvince] = useState(leagueRegions[0].provinces[0].id)
    const [selectedTeamId, setSelectedTeamId] = useState('new')
    const [selectedFixtureHome, setSelectedFixtureHome] = useState('')
    const [selectedFixtureAway, setSelectedFixtureAway] = useState('')
    const [selectedFixtureCompetition, setSelectedFixtureCompetition] = useState('')
    const [scheduledGround, setScheduledGround] = useState('')

    useEffect(() => {
        if (!getAuthToken() || !user) navigate('/admin', { replace: true })
    }, [navigate, user])

    if (!getAuthToken() || !user) return null

    const canAccessDashboard = isSuperAdmin || isRegionAdmin || isProvinceAdmin
    const leagueRegion = findRegion(isSuperAdmin ? selectedLeagueRegion : assignedRegion?.id)
    const leagueProvinceOptions = leagueRegion?.provinces || []
    const leagueProvince = isProvinceAdmin
        ? assignedProvince
        : findProvince(leagueRegion, selectedLeagueProvince) || leagueProvinceOptions[0]
    const adminRegion = findRegion(selectedAdminRegion) || leagueRegions[0]
    const adminProvinceOptions = adminRegion.provinces
    const adminProvince = findProvince(adminRegion, selectedAdminProvince) || adminProvinceOptions[0]
    const selectedTeam = teamsRequest.data.find(team => String(team.id) === String(selectedTeamId))
    const fixtureTeams = teamsRequest.data.filter(team =>
        String(team.competition || '').trim().toLowerCase() === selectedFixtureCompetition.trim().toLowerCase(),
    )
    const visibleLeagues = leaguesRequest.data.filter(league => {
        if (isSuperAdmin) return true
        const location = getLeagueLocation(league)
        if (location.region?.id !== assignedRegion?.id) return false
        return !isProvinceAdmin || location.province?.id === assignedProvince?.id
    })

    async function handleSubmit(event) {
        event.preventDefault()
        setIsSaving(true)
        setNotice('')
        const form = event.currentTarget
        const values = Object.fromEntries(new FormData(form))

        try {
            let result
            if (activeResource === 'admin') {
                const account = {
                    name: values.name,
                    email: values.email,
                    password: values.password,
                    role: values.role,
                    region: values.region,
                    ...(values.role === 'province-admin' ? { province: values.province } : {}),
                }
                result = await createAdminAccount(account)
            } else if (activeResource === 'team') {
                const profile = {
                    name: values.name,
                    homeGround: values.homeGround,
                    logo: values.logo,
                    banner: values.banner,
                    tagline: values.tagline,
                    description: values.description,
                    founded: values.founded,
                    coach: values.coach,
                    captain: values.captain,
                    competition: values.competition,
                    region: values.clubRegion,
                    province: values.clubProvince,
                    district: values.clubDistrict,
                    colors: values.colors.split(',').map(color => color.trim()).filter(Boolean),
                    players: parseRows(values.players, ([name, position, number, photo], index) => ({ id: `player-${index + 1}`, name, position, number, photo })),
                    staff: parseRows(values.staff, ([name, role, photo], index) => ({ id: `staff-${index + 1}`, name, role, photo })),
                    honours: parseRows(values.honours, ([title, years]) => ({ title, years })),
                    stats: {
                        played: Number(values.played) || 0,
                        wins: Number(values.wins) || 0,
                        losses: Number(values.losses) || 0,
                        draws: Number(values.draws) || 0,
                        pointsFor: Number(values.pointsFor) || 0,
                        pointsAgainst: Number(values.pointsAgainst) || 0,
                    },
                }
                result = selectedTeamId === 'new'
                    ? await createResource('teams', profile)
                    : await updateResource('teams', selectedTeamId, profile)
            } else if (activeResource === 'league') {
                const registration = {
                    name: values.name,
                    format: values.format,
                    region: isSuperAdmin ? values.region : assignedRegion.id,
                    province: isProvinceAdmin ? assignedProvince.id : values.province,
                    district: values.district.trim(),
                    season: values.season,
                    clubs: values.clubs.split(/[\n,]/).map(club => club.trim()).filter(Boolean),
                    venue: values.venue,
                    contactName: values.contactName,
                    contactEmail: values.contactEmail,
                    contactPhone: values.contactPhone,
                    registrationStatus: 'registered',
                }
                result = await createResource('leagues', registration)
            } else {
                const fixture = {
                    ...values,
                    leagueId: values.leagueId || '',
                    homeLineup: parseLineup(values.homeLineup || '', 'home'),
                    awayLineup: parseLineup(values.awayLineup || '', 'away'),
                }
                result = await createResource('fixtures', fixture)
            }

            if (USE_MOCK_DATA && activeResource === 'admin') {
                setNotice('Preview only: mock mode cannot create administrator accounts. Connect the API and disable mock mode to provision this account.')
                return
            }

            const resourceLabel = activeResource === 'admin' ? 'Administrator' : activeResource === 'league' ? 'League registration' : activeResource === 'team' ? 'Team' : 'Fixture'
            setNotice(USE_MOCK_DATA
                ? `${resourceLabel} saved in this browser preview and is now visible on public pages. It will not sync to other browsers.`
                : `${resourceLabel} created successfully.`)
            if (activeResource === 'team') {
                teamsRequest.setData(current => {
                    const index = current.findIndex(team => String(team.id) === String(result.id))
                    return index < 0
                        ? [...current, result]
                        : current.map((team, teamIndex) => teamIndex === index ? { ...team, ...result } : team)
                })
                setSelectedTeamId(String(result.id))
            } else {
                form.reset()
                if (activeResource === 'fixture') {
                    setSelectedFixtureHome('')
                    setScheduledGround('')
                }
            }
            if (activeResource === 'fixture') fixturesRequest.reload()
            if (activeResource === 'league') leaguesRequest.reload()
            return result
        } catch (requestError) {
            setNotice(requestError.message)
        } finally {
            setIsSaving(false)
        }
    }

    function handleLogout() {
        clearAuthSession()
        navigate('/admin', { replace: true })
    }

    function renderRegistrationForm() {
        return <>
            <label>Competition name<input name="name" required /></label>
            <label>Format
                <select name="format" required defaultValue="9s">
                    {leagueFormats.map(format => <option key={format.id} value={format.id}>{format.label}</option>)}
                </select>
            </label>
            {isSuperAdmin ? <>
                <label>Region
                    <select name="region" value={selectedLeagueRegion} onChange={event => {
                        const nextRegion = findRegion(event.target.value)
                        setSelectedLeagueRegion(event.target.value)
                        setSelectedLeagueProvince(nextRegion?.provinces[0].id || '')
                    }}>
                        {leagueRegions.map(region => <option key={region.id} value={region.id}>{region.name}</option>)}
                    </select>
                </label>
                <label>Province
                    <select name="province" value={leagueProvince?.id || ''} onChange={event => setSelectedLeagueProvince(event.target.value)} required>
                        {leagueProvinceOptions.map(province => <option key={province.id} value={province.id}>{province.name}</option>)}
                    </select>
                </label>
            </> : isProvinceAdmin ? <>
                <label>Region<input value={assignedRegion.name} readOnly /></label>
                <label>Province<input value={assignedProvince.name} readOnly /></label>
            </> : <>
                <label>Region<input value={assignedRegion.name} readOnly /></label>
                <label>Province
                    <select name="province" value={leagueProvince?.id || ''} onChange={event => setSelectedLeagueProvince(event.target.value)} required>
                        {leagueProvinceOptions.map(province => <option key={province.id} value={province.id}>{province.name}</option>)}
                    </select>
                </label>
            </>}
            <label>District<input name="district" placeholder="District name" /></label>
            <label>Season<input name="season" placeholder="e.g. 2026" required /></label>
            <label>Home venue<input name="venue" required /></label>
            <label>Contact name<input name="contactName" required /></label>
            <label>Contact email<input name="contactEmail" type="email" required /></label>
            <label>Contact phone<input name="contactPhone" type="tel" required /></label>
            <label className="admin-form-wide">Registered clubs<textarea name="clubs" rows="4" placeholder="Enter one club per line" /></label>
        </>
    }

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <div>
                    <p className="eyebrow">Content operations</p>
                    <h1>PNG RFL Admin Panel</h1>
                    <p>{user.name || user.email} · {isSuperAdmin ? 'Super administrator' : assignedProvince?.name || assignedRegion?.name || 'Scoped administrator'}</p>
                </div>
                <div className="admin-header-actions">
                    <Link to="/">View public site</Link>
                    <button type="button" onClick={handleLogout}>Log out</button>
                </div>
            </header>

            {!canAccessDashboard || !hasLeagueScope ? (
                <p className="form-error" role="alert">This account has no valid regional or provincial assignment. Ask the super administrator to update its access.</p>
            ) : <>
                <section className="admin-summary" aria-label="Content summary">
                    {isSuperAdmin && <>
                        <div><strong>{teamsRequest.data.length}</strong><span>Teams</span></div>
                        <div><strong>{fixturesRequest.data.length}</strong><span>Fixtures</span></div>
                    </>}
                    <div><strong>{visibleLeagues.length}</strong><span>League registrations in scope</span></div>
                    <div><strong>{isSuperAdmin ? 'All regions' : assignedProvince?.name || assignedRegion.name}</strong><span>Assigned access</span></div>
                </section>

                <section className="admin-workspace">
                    <div className="admin-tabs" role="tablist" aria-label="Admin tools">
                        {isSuperAdmin && <>
                            <button type="button" role="tab" aria-selected={activeResource === 'team'} className={activeResource === 'team' ? 'active' : ''} onClick={() => { setActiveResource('team'); setNotice('') }}>Teams</button>
                            <button type="button" role="tab" aria-selected={activeResource === 'fixture'} className={activeResource === 'fixture' ? 'active' : ''} onClick={() => { setActiveResource('fixture'); setNotice('') }}>Fixtures</button>
                            <button type="button" role="tab" aria-selected={activeResource === 'admin'} className={activeResource === 'admin' ? 'active' : ''} onClick={() => { setActiveResource('admin'); setNotice('') }}>Create admin</button>
                        </>}
                        <button type="button" role="tab" aria-selected={activeResource === 'league'} className={activeResource === 'league' ? 'active' : ''} onClick={() => { setActiveResource('league'); setNotice('') }}>League registrations</button>
                    </div>

                    <form key={`${activeResource}-${selectedTeamId}`} className="admin-resource-form" onSubmit={handleSubmit}>
                        <h2>{activeResource === 'admin' ? 'Create a regional or provincial admin' : activeResource === 'league' ? 'Register a league competition' : activeResource === 'team' ? selectedTeamId === 'new' ? 'Create a club profile' : 'Update club profile' : 'Add fixture'}</h2>
                        {activeResource === 'team' ? <>
                            <label className="admin-form-wide">Club profile
                                <select value={selectedTeamId} onChange={event => setSelectedTeamId(event.target.value)}>
                                    <option value="new">Create a new club</option>
                                    {teamsRequest.data.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
                                </select>
                            </label>
                            <label>Club name<input name="name" defaultValue={selectedTeam?.name || ''} required /></label>
                            <label>Home ground<input name="homeGround" defaultValue={selectedTeam?.homeGround || ''} required /></label>
                            <label>Founded<input name="founded" defaultValue={selectedTeam?.founded || ''} placeholder="Year" /></label>
                            <label>Club colours<input name="colors" defaultValue={selectedTeam?.colors?.join(', ') || ''} placeholder="Red, black, gold" /></label>
                            <label>Head coach<input name="coach" defaultValue={selectedTeam?.coach || ''} /></label>
                            <label>Captain<input name="captain" defaultValue={selectedTeam?.captain || ''} /></label>
                            <label>Competition<select name="competition" defaultValue={selectedTeam?.competition || allCompetitions[0]} required>
                                {allCompetitions.map(competition => <option key={competition} value={competition}>{competition}</option>)}
                            </select></label>
                            <label>Region<input name="clubRegion" defaultValue={selectedTeam?.region || ''} /></label>
                            <label>Province<input name="clubProvince" defaultValue={selectedTeam?.province || ''} /></label>
                            <label>District<input name="clubDistrict" defaultValue={selectedTeam?.district || ''} /></label>
                            <label>Tagline<input name="tagline" defaultValue={selectedTeam?.tagline || ''} /></label>
                            <label>Logo image path or URL<input name="logo" defaultValue={selectedTeam?.logo || ''} placeholder="/assets/club-logo.png or https://..." /></label>
                            <label className="admin-form-wide">Banner image path or URL<input name="banner" defaultValue={selectedTeam?.banner || ''} placeholder="/assets/club-banner.jpg or https://..." /></label>
                            <label className="admin-form-wide">Club profile<textarea name="description" rows="3" defaultValue={selectedTeam?.description || ''} /></label>
                            <label className="admin-form-wide">Players<textarea name="players" rows="5" defaultValue={selectedTeam?.players?.map(player => [player.name, player.position, player.number, player.photo].filter(Boolean).join(' | ')).join('\n') || ''} placeholder="Full name | Position | Jersey number | Photo URL" /></label>
                            <label className="admin-form-wide">Coaching staff<textarea name="staff" rows="3" defaultValue={selectedTeam?.staff?.map(member => [member.name, member.role, member.photo].filter(Boolean).join(' | ')).join('\n') || ''} placeholder="Full name | Role | Photo URL" /></label>
                            <label className="admin-form-wide">Honours<textarea name="honours" rows="3" defaultValue={selectedTeam?.honours?.map(honour => `${honour.title} | ${honour.years}`).join('\n') || ''} placeholder="Competition title | Year(s)" /></label>
                            <fieldset className="admin-form-wide admin-stats-fields">
                                <legend>Season statistics</legend>
                                {['played', 'wins', 'losses', 'draws', 'pointsFor', 'pointsAgainst'].map(stat => (
                                    <label key={stat}>{stat.replace(/([A-Z])/g, ' $1')}
                                        <input type="number" name={stat} min="0" defaultValue={selectedTeam?.stats?.[stat] ?? 0} />
                                    </label>
                                ))}
                            </fieldset>
                        </> : activeResource === 'fixture' ? <>
                            <label>Home team<select name="home" required value={selectedFixtureHome} onChange={event => {
                                const homeTeam = fixtureTeams.find(team => team.name === event.target.value)
                                setSelectedFixtureHome(event.target.value)
                                setScheduledGround(homeTeam?.homeGround || '')
                            }}>
                                <option value="" disabled>Select a club</option>
                                {fixtureTeams.map(team => <option key={team.id} value={team.name}>{team.name}</option>)}
                            </select></label>
                            <label>Away team<select name="away" required value={selectedFixtureAway} onChange={event => setSelectedFixtureAway(event.target.value)}>
                                <option value="" disabled>Select a club</option>
                                {fixtureTeams.map(team => <option key={team.id} value={team.name}>{team.name}</option>)}
                            </select></label>
                            <label>Round<input name="round" placeholder="Round 1" required /></label>
                            <label>Competition<select name="competition" value={selectedFixtureCompetition} onChange={event => {
                                setSelectedFixtureCompetition(event.target.value)
                                setSelectedFixtureHome('')
                                setSelectedFixtureAway('')
                                setScheduledGround('')
                            }} required>
                                <option value="" disabled>Select a major competition</option>
                                {allCompetitions.map(competition => <option key={competition} value={competition}>{competition}</option>)}
                            </select></label>
                            <label>League<select name="leagueId" defaultValue="">
                                <option value="">Not linked to a league</option>
                                {leaguesRequest.data.map(league => <option key={league.id} value={league.id}>{league.name}</option>)}
                            </select></label>
                            <label>Scheduled home ground<input name="venue" value={scheduledGround} onChange={event => setScheduledGround(event.target.value)} placeholder="Home club ground or another venue" required /></label>
                            <label>Date<input name="date" type="date" required /></label>
                            <label>Time<input name="time" type="time" required /></label>
                            <label>Status<select name="status" defaultValue="scheduled"><option value="scheduled">Scheduled</option><option value="completed">Completed</option></select></label>
                            <label>Score<input name="score" placeholder="Home-Away, e.g. 18-12" /></label>
                            <label className="admin-form-wide">Home line-up<textarea name="homeLineup" rows="6" placeholder={'One player per line: Name | Position | Number | Starter/In/Out | Stats (e.g. Tries: 2, Tackles: 18)'} /></label>
                            <label className="admin-form-wide">Away line-up<textarea name="awayLineup" rows="6" placeholder={'One player per line: Name | Position | Number | Starter/In/Out | Stats (e.g. Tries: 2, Tackles: 18)'} /></label>
                        </> : activeResource === 'league' ? renderRegistrationForm() : <>
                            <label>Full name<input name="name" required /></label>
                            <label>Email<input name="email" type="email" required /></label>
                            <label>Initial password<input name="password" type="password" minLength="8" autoComplete="new-password" required /></label>
                            <label>Admin scope
                                <select name="role" value={adminRole} onChange={event => setAdminRole(event.target.value)}>
                                    <option value="region-admin">Regional admin</option>
                                    <option value="province-admin">Provincial admin</option>
                                </select>
                            </label>
                            <label>Region
                                <select name="region" value={selectedAdminRegion} onChange={event => {
                                    const nextRegion = findRegion(event.target.value)
                                    setSelectedAdminRegion(event.target.value)
                                    setSelectedAdminProvince(nextRegion?.provinces[0].id || '')
                                }}>
                                    {leagueRegions.map(region => <option key={region.id} value={region.id}>{region.name}</option>)}
                                </select>
                            </label>
                            {adminRole === 'province-admin' && <label>Province
                                <select name="province" value={adminProvince.id} onChange={event => setSelectedAdminProvince(event.target.value)} required>
                                    {adminProvinceOptions.map(province => <option key={province.id} value={province.id}>{province.name}</option>)}
                                </select>
                            </label>}
                        </>}
                        <button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : activeResource === 'admin' ? 'Create admin account' : activeResource === 'league' ? 'Save league registration' : activeResource === 'team' && selectedTeamId !== 'new' ? 'Update club profile' : activeResource === 'team' ? 'Publish club profile' : 'Save match'}</button>
                        {notice && <p className="form-notice" role="status">{notice}</p>}
                    </form>
                </section>

                {isSuperAdmin && <section className="admin-data-preview">
                    <div>
                        <h2>Teams</h2>
                        <RequestState {...teamsRequest} onRetry={teamsRequest.reload} />
                        {teamsRequest.data.map(team => <p key={team.id}>{team.name}<span>{team.homeGround}</span></p>)}
                    </div>
                    <div>
                        <h2>Upcoming fixtures</h2>
                        <RequestState {...fixturesRequest} onRetry={fixturesRequest.reload} />
                        {fixturesRequest.data.map(fixture => <p key={fixture.id}>{fixture.home} v {fixture.away}<span>{fixture.date}</span></p>)}
                    </div>
                </section>}

                <section className="admin-league-preview">
                    <h2>League registrations in your scope</h2>
                    <RequestState {...leaguesRequest} onRetry={leaguesRequest.reload} />
                    {visibleLeagues.map(league => <p key={league.id}>{league.name}<span>{league.format} · {league.province}{league.district ? ` · ${league.district}` : ''}</span></p>)}
                </section>
            </>}
        </div>
    )
}