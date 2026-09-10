import { Link } from 'react-router-dom'
import './Admin.css'

export default function AdminDashboard() {
    return (
        <div className="admin-dashboard">
            <h1>PNG RFL Admin Panel</h1>

            <div className="admin-cards">
                <div className="admin-card">Manage Teams</div>
                <div className="admin-card">Manage Fixtures</div>
                <div className="admin-card">Manage Players</div>
                <div className="admin-card">Publish News</div>
            </div>

            <Link to="/admin">Back to admin login</Link>
        </div>
    )
}
