import pngRflLogo from '../assets/logos/pngrfl.jpg'
import { request } from './client'

const mockTeams = [
    { id: 'png-rfl-select', name: 'PNG RFL Select', homeGround: 'National Football Stadium', logo: pngRflLogo, status: 'published' },
    { id: 'port-moresby', name: 'Port Moresby', homeGround: 'Mitsubishi Oval', logo: pngRflLogo, status: 'published' },
    { id: 'lae', name: 'Lae', homeGround: 'Lae Rugby League Oval', logo: pngRflLogo, status: 'published' },
]

const mockFixtures = [
    { id: 'fixture-001', round: 'Round 1', home: 'Port Moresby', away: 'Lae', venue: 'Mitsubishi Oval', date: '2026-04-04', time: '15:00', status: 'scheduled' },
    { id: 'fixture-002', round: 'Round 1', home: 'PNG RFL Select', away: 'Port Moresby', venue: 'National Football Stadium', date: '2026-04-05', time: '15:00', status: 'scheduled' },
]

const mockLadder = mockTeams.map((team, index) => ({
    position: index + 1,
    team: team.name,
    played: 0,
    wins: 0,
    losses: 0,
    points: 0,
}))

export const getTeams = () => request('/teams', { fallback: mockTeams })
export const getTeamById = teamId => request(`/teams/${teamId}`, {
    fallback: mockTeams.find(team => team.id === teamId) || null,
})
export const getFixtures = () => request('/fixtures', { fallback: mockFixtures })
export const getLadder = () => request('/ladder', { fallback: mockLadder })
export const getLeagues = () => request('/leagues', {
    fallback: [
        { id: 'southern-region', name: 'Southern Region League', clubs: ['Port Moresby', 'Central Province'] },
        { id: 'momase-region', name: 'Momase Region League', clubs: ['Lae', 'Madang'] },
    ],
})

export const getProducts = () => request('/products', {
    fallback: [
        { id: 'supporter-cap', name: 'PNG RFL Supporter Cap', price: 'K80', status: 'coming-soon' },
        { id: 'training-tee', name: 'PNG RFL Training Tee', price: 'K120', status: 'coming-soon' },
        { id: 'replica-jersey', name: 'PNG RFL Replica Jersey', price: 'K250', status: 'coming-soon' },
    ],
})

export const createResource = (resource, payload) => request(`/${resource}`, {
    method: 'POST',
    body: JSON.stringify(payload),
    fallback: { ...payload, id: `draft-${Date.now()}`, status: 'draft' },
})

export const updateResource = (resource, id, payload) => request(`/${resource}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
    fallback: { ...payload, id },
})

export const deleteResource = (resource, id) => request(`/${resource}/${id}`, {
    method: 'DELETE',
    fallback: { id, deleted: true },
})

export const login = credentials => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
    fallback: { token: 'development-token', user: { email: credentials.email, role: 'admin' } },
})

export const signup = details => request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(details),
    fallback: { token: 'development-token', user: { email: details.email, role: 'admin' } },
})