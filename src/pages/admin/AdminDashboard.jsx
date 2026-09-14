import { useState } from 'react'
import { Link } from 'react-router-dom'
import { createResource, getFixtures, getTeams } from '../../api/resources'
import { useApi } from '../../hooks/useApi'
import RequestState from '../../Components/ui/RequestState'
import './Admin.css'

export default function AdminDashboard() {
    const teamsRequest = useApi(getTeams, [])
    const fixturesRequest = useApi(getFixtures, [])
    const [activeResource, setActiveResource] = useState('team')
    const [notice, setNotice] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    async function handleSubmit(event) {
        event.preventDefault()
        setIsSaving(true)
        setNotice('')
        const values = Object.fromEntries(new FormData(event.currentTarget))
        try {
            await createResource(activeResource === 'team' ? 'teams' : 'fixtures', values)
            setNotice(`${activeResource === 'team' ? 'Team' : 'Fixture'} saved and ready for review.`)
            event.currentTarget.reset()
            if (activeResource === 'team') teamsRequest.reload()
            else fixturesRequest.reload()
        } catch (requestError) {
            setNotice(requestError.message)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="admin-dashboard">
            <header className="admin-header">
                <div>
                    <p className="eyebrow">Content operations</p>
                    <h1>PNG RFL Admin Panel</h1>
                    <p>Manage the resources that power the public website.</p>
                </div>
                <Link to="/">View public site</Link>
            </header>

            <section className="admin-summary" aria-label="Content summary">
                <div><strong>{teamsRequest.data.length}</strong><span>Teams</span></div>
                <div><strong>{fixturesRequest.data.length}</strong><span>Fixtures</span></div>
                <div><strong>0</strong><span>Drafts</span></div>
                <div><strong>Live</strong><span>Environment</span></div>
            </section>

            <section className="admin-workspace">
                <div className="admin-tabs" role="tablist" aria-label="Content type">
                    <button type="button" className={activeResource === 'team' ? 'active' : ''} onClick={() => setActiveResource('team')}>Teams</button>
                    <button type="button" className={activeResource === 'fixture' ? 'active' : ''} onClick={() => setActiveResource('fixture')}>Fixtures</button>
                </div>

                <form className="admin-resource-form" onSubmit={handleSubmit}>
                    <h2>Add {activeResource === 'team' ? 'team' : 'fixture'}</h2>
                    {activeResource === 'team' ? <>
                        <label>Team name<input name="name" required /></label>
                        <label>Home ground<input name="homeGround" required /></label>
                        <label>Logo URL<input name="logo" type="url" placeholder="https://..." /></label>
                    </> : <>
                        <label>Home team<input name="home" required /></label>
                        <label>Away team<input name="away" required /></label>
                        <label>Venue<input name="venue" required /></label>
                        <label>Date<input name="date" type="date" required /></label>
                        <label>Time<input name="time" type="time" required /></label>
                    </>}
                    <button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save draft'}</button>
                    {notice && <p className="form-notice" role="status">{notice}</p>}
                </form>
            </section>

            <section className="admin-data-preview">
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
            </section>

            <Link to="/admin">Back to admin login</Link>
        </div>
    )
}
