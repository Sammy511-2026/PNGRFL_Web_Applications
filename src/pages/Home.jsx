import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { teams } from '../data/Teams'
import './Home.css'


import action1 from '../assets/hero/action1.jpg'
import action2 from '../assets/hero/action2.jpeg'
import action3 from '../assets/hero/action3.jpg'
import action4 from '../assets/hero/action4.jpg'
import action6 from '../assets/hero/action6.jpeg'
import action7 from '../assets/hero/action7.jpg'
import action8 from '../assets/hero/action8.jpg'
import action10 from '../assets/hero/action10.jpg'

export default function Home() {
    const heroSlides = [
        action1,
        action2,
        action3,
        action4,
        action6,
        action7,
        action8,
        action10
    ]

    const [currentSlide, setCurrentSlide] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % heroSlides.length)
        }, 4000)

        return () => clearInterval(interval)
    }, [heroSlides.length])

    return (
        <>
            {/* HERO */}
            <section
                className="hero"
                style={{ backgroundImage: `url(${heroSlides[currentSlide]})` }}
            >
                <div className="hero-overlay">
                    <h1>PNG Rugby Football League</h1>
                    <p>Official home of the Digicel ExxonMobil Cup</p>
                </div>
            </section>

            {/* FEATURED COMPETITION */}
            <section className="competition-highlight">
                <h2>Digicel ExxonMobil Cup</h2>
                <p>PNG’s premier rugby league competition</p>
                <Link to="/fixtures" className="btn-primary">
                    View Fixtures
                </Link>
            </section>

            {/* CLUBS PREVIEW */}
            <section className="teams-section">
                <h2>PNG RFL Clubs</h2>

                <div className="teams-preview">
                    {teams.slice(0, 6).map(team => (
                        <Link
                            key={team.id}
                            to={`/teams/${team.id}`}
                            className="team-preview-card"
                        >
                            <img src={team.logo} alt={team.name} />
                            <span>{team.name}</span>
                        </Link>
                    ))}
                </div>

                <Link to="/teams" className="btn-outline">
                    View All Clubs
                </Link>
            </section>
        </>
    )
}
