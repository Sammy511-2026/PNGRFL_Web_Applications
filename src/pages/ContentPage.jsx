const pageContent = {
    competitions: {
        eyebrow: 'The season',
        title: 'Major Competitions',
        intro: 'Follow the competitions that bring Papua New Guinea rugby league together.',
        items: ['Digicel ExxonMobil Cup', 'National Schoolboys Championship', 'Women’s Rugby League'],
    },
    rules: {
        eyebrow: 'Play with purpose',
        title: 'Rules & Regulations',
        intro: 'Official competition rules, policies, and player welfare information will be published here.',
        items: ['Competition rules', 'Disciplinary code', 'Safeguarding and integrity'],
    },
    board: {
        eyebrow: 'Our organisation',
        title: 'PNG RFL Board',
        intro: 'Meet the people responsible for developing and governing rugby league across Papua New Guinea.',
        items: ['Board members', 'Annual reports', 'Contact the league'],
    },
}

export default function ContentPage({ page }) {
    const content = pageContent[page]

    return (
        <main className="content-page">
            <p className="eyebrow">{content.eyebrow}</p>
            <h1>{content.title}</h1>
            <p className="content-intro">{content.intro}</p>
            <div className="content-grid">
                {content.items.map(item => (
                    <article key={item} className="content-panel">
                        <h2>{item}</h2>
                        <p>Information will be published by PNG RFL administrators.</p>
                    </article>
                ))}
            </div>
        </main>
    )
}