import pngRflLogo from '../assets/logos/pngrfl.jpg'
import { leagues } from '../data/Leagues'
import { request, USE_MOCK_DATA } from './client'

const MOCK_RESOURCES_KEY = 'pngrfl_public_resources'

function readMockResource(resource) {
    try {
        const resources = JSON.parse(window.localStorage.getItem(MOCK_RESOURCES_KEY) || '{}')
        return Array.isArray(resources[resource]) ? resources[resource] : []
    } catch {
        return []
    }
}

function getMockResource(resource, seed = []) {
    const records = new Map(seed.map(record => [String(record.id), record]))
    readMockResource(resource).forEach(record => {
        records.set(String(record.id), { ...records.get(String(record.id)), ...record })
    })
    return [...records.values()]
}

function saveMockResource(resource, record) {
    const resources = JSON.parse(window.localStorage.getItem(MOCK_RESOURCES_KEY) || '{}')
    const records = Array.isArray(resources[resource]) ? resources[resource] : []
    const existingIndex = records.findIndex(item => String(item.id) === String(record.id))
    const nextRecords = existingIndex < 0
        ? [...records, record]
        : records.map((item, index) => index === existingIndex ? { ...item, ...record } : item)
    const nextResources = { ...resources, [resource]: nextRecords }
    window.localStorage.setItem(MOCK_RESOURCES_KEY, JSON.stringify(nextResources))
}

function createMockResource(resource, payload) {
    const id = `local-${resource}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
    const record = {
        ...payload,
        id,
        ...(resource === 'teams' ? { logo: payload.logo || pngRflLogo, status: 'published' } : {}),
        ...(resource === 'fixtures' ? { round: payload.round || 'Upcoming', status: payload.status || 'scheduled' } : {}),
        ...(resource === 'leagues' ? { status: 'published' } : {}),
    }
    saveMockResource(resource, record)
    return record
}

const mockTeams = [
    { id: 'png-rfl-select', name: 'PRK Mendi Muruks', competition: 'Digicel ExxonMobil Cup', homeGround: 'Lae Rugby League Oval', logo: pngRflLogo, status: 'published' },
    { id: 'port-moresby', name: 'Moni Plus NCD Vipers', competition: 'Digicel ExxonMobil Cup', homeGround: 'Santos Football Stadium', logo: pngRflLogo, status: 'published' },
    { id: 'lae', name: 'Snax Tigers', competition: 'Digicel ExxonMobil Cup', homeGround: 'Lae Rugby League Oval', logo: pngRflLogo, status: 'published' },
]

const mockFixtures = [
    { id: 'fixture-001', competition: 'Digicel ExxonMobil Cup', season: '2026', round: 'Round 1', home: 'Moni Plus NCD Vipers', away: 'Snax Tigers', venue: 'Santos Football Stadium    ', date: '2026-04-04', time: '15:00', status: 'scheduled' },
    { id: 'fixture-002', competition: 'Digicel ExxonMobil Cup', season: '2026', round: 'Round 1', home: 'PRK Mendi Muruks', away: 'Moni Plus NCD Vipers', venue: 'National Football Stadium', date: '2026-04-05', time: '15:00', status: 'scheduled' },
]

const mockLadder = mockTeams.map((team, index) => ({
    position: index + 1,
    team: team.name,
    played: 0,
    wins: 0,
    losses: 0,
    points: 0,
}))

export const getTeams = () => USE_MOCK_DATA
    ? Promise.resolve(getMockResource('teams', mockTeams))
    : request('/teams', { fallback: mockTeams })
export const getTeamById = teamId => USE_MOCK_DATA
    ? Promise.resolve(getMockResource('teams', mockTeams).find(team => String(team.id) === String(teamId)) || null)
    : request(`/teams/${teamId}`, { fallback: mockTeams.find(team => team.id === teamId) || null })
export const getFixtures = () => USE_MOCK_DATA
    ? Promise.resolve(getMockResource('fixtures', mockFixtures))
    : request('/fixtures', { fallback: mockFixtures })
export const getLadder = () => USE_MOCK_DATA
    ? getTeams().then(teams => teams.map((team, index) => ({
        position: index + 1,
        team: team.name,
        played: 0,
        wins: 0,
        losses: 0,
        points: 0,
    })))
    : request('/ladder', { fallback: mockLadder })
export const getLeagues = () => USE_MOCK_DATA
    ? Promise.resolve(getMockResource('leagues', leagues))
    : request('/leagues', { fallback: leagues })

export const getProducts = () => request('/products', {
    fallback: [
        { id: 'supporter-cap', name: 'PNG RFL Supporter Cap', price: 'K80', status: 'coming-soon' },
        { id: 'training-tee', name: 'PNG RFL Training Tee', price: 'K120', status: 'coming-soon' },
        { id: 'replica-jersey', name: 'PNG RFL Replica Jersey', price: 'K250', status: 'coming-soon' },
    ],
})

export const createResource = (resource, payload) => {
    if (USE_MOCK_DATA && ['teams', 'fixtures', 'leagues'].includes(resource)) {
        return Promise.resolve(createMockResource(resource, payload))
    }

    return request(`/${resource}`, {
        method: 'POST',
        body: JSON.stringify(payload),
        fallback: { ...payload, id: `draft-${Date.now()}`, status: 'draft' },
    })
}

export const updateResource = (resource, id, payload) => {
    if (USE_MOCK_DATA && ['teams', 'fixtures', 'leagues'].includes(resource)) {
        const existing = getMockResource(resource, resource === 'teams' ? mockTeams : []).find(record => String(record.id) === String(id))
        if (!existing) throw new Error(`The ${resource} record could not be found.`)
        const record = { ...existing, ...payload, id }
        saveMockResource(resource, record)
        return Promise.resolve(record)
    }

    return request(`/${resource}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
        fallback: { ...payload, id },
    })
}

export const deleteResource = (resource, id) => request(`/${resource}/${id}`, {
    method: 'DELETE',
    fallback: { id, deleted: true },
})

export const login = credentials => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
    fallback: { token: 'development-token', user: { email: credentials.email, role: 'super-admin' } },
})

export const createAdminAccount = details => request('/admins', {
    method: 'POST',
    body: JSON.stringify(details),
    fallback: {
        id: `draft-${Date.now()}`,
        name: details.name,
        email: details.email,
        role: details.role,
        region: details.region,
        province: details.province,
        status: 'draft',
    },
})