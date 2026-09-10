import './PlayersList.css'

export default function PlayersList({ players }) {
    return (
        <div className="players-grid">
            {players.map(player => (
                <div key={player.id} className="player-card">
                    <img src={player.photo} alt={player.name} />
                    <h4>{player.name}</h4>
                    <p>{player.position}</p>
                </div>
            ))}
        </div>
    )
}
