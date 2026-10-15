export const leagueFormats = [
	{ id: '9s', label: 'Rugby League 9s' },
	{ id: '13s', label: 'Rugby League 13s' },
]

export const leagueRegions = [
	{
		id: 'southern',
		name: 'Southern Region',
		provinces: [
			{ id: 'central', name: 'Central Province' },
			{ id: 'gulf', name: 'Gulf Province' },
			{ id: 'milne-bay', name: 'Milne Bay Province' },
			{ id: 'national-capital-district', name: 'National Capital District' },
			{ id: 'oro', name: 'Oro Province', aliases: ['Northern Province'] },
			{ id: 'western', name: 'Western Province' },
		],
	},
	{
		id: 'highlands',
		name: 'Highlands Region',
		provinces: [
			{ id: 'eastern-highlands', name: 'Eastern Highlands Province' },
			{ id: 'enga', name: 'Enga Province' },
			{ id: 'hela', name: 'Hela Province' },
			{ id: 'jiwaka', name: 'Jiwaka Province' },
			{ id: 'simbu', name: 'Simbu Province', aliases: ['Chimbu Province'] },
			{ id: 'southern-highlands', name: 'Southern Highlands Province' },
			{ id: 'western-highlands', name: 'Western Highlands Province' },
		],
	},
	{
		id: 'momase',
		name: 'Momase Region',
		provinces: [
			{ id: 'east-sepik', name: 'East Sepik Province' },
			{ id: 'madang', name: 'Madang Province' },
			{ id: 'morobe', name: 'Morobe Province' },
			{ id: 'west-sepik', name: 'West Sepik (Sandaun) Province', aliases: ['Sandaun Province', 'West Sepik Province'] },
		],
	},
	{
		id: 'islands',
		name: 'New Guinea Islands Region',
		provinces: [
			{ id: 'east-new-britain', name: 'East New Britain Province' },
			{ id: 'manus', name: 'Manus Province' },
			{ id: 'new-ireland', name: 'New Ireland Province' },
			{ id: 'west-new-britain', name: 'West New Britain Province' },
			{ id: 'autonomous-region-of-bougainville', name: 'Autonomous Region of Bougainville' },
		],
	},
]

function normalizeLocation(value) {
	return String(value || '')
		.trim()
		.toLowerCase()
		.replace(/\s+province$/, '')
		.replace(/[^a-z0-9]+/g, '')
}

export function getLeagueLocation(league) {
	const provinceValue = normalizeLocation(league.province)
	const regionValue = normalizeLocation(league.region)
	const provinceRegion = leagueRegions.find(region =>
		region.provinces.some(province => [
			province.id,
			province.name,
			...(province.aliases || []),
		].some(value => normalizeLocation(value) === provinceValue)),
	)
	const region = provinceRegion || leagueRegions.find(item =>
		normalizeLocation(item.id) === regionValue
		|| normalizeLocation(item.name) === regionValue,
	)
	const province = region?.provinces.find(item =>
		[item.id, item.name, ...(item.aliases || [])]
			.some(value => normalizeLocation(value) === provinceValue),
	)

	return { region, province }
}

export const leagues = []