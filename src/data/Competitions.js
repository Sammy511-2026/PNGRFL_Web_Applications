export const majorCompetitions = [
    'Digicel ExxonMobil Cup',
    'National Schoolboys Championship',
    'Rigo Rice Cup',
    'Coca-Cola Ipatas Cup',
]

export const nestedCompetitions = {
    'Digicel ExxonMobil Cup': ['Women’s Rugby League'],
}

export const allCompetitions = [
    ...majorCompetitions.flatMap(competition => [
        competition,
        ...(nestedCompetitions[competition] || []),
    ]),
]

export function getCompetitionSlug(competition) {
    return competition
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
}
