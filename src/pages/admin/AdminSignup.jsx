import { Link } from 'react-router-dom'
import './Admin.css'

export default function AdminSignup() {
    return (
        <main className="admin-signup">
            <h1>Admin accounts are managed centrally</h1>
            <p>Ask the PNG RFL super administrator to create an account for your region or province.</p>
            <Link to="/admin">Return to admin login</Link>
        </main>
    )
}