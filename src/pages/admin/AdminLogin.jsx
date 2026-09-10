import { Link } from 'react-router-dom'
import './Admin.css'

export default function AdminLogin() {
    function handleSubmit(event) {
        event.preventDefault()
    }

    return (
        <main className="admin-login">
            <h1>Admin Access</h1>
            <p>Log in to manage PNG RFL content.</p>

            <form onSubmit={handleSubmit}>
                <label>
                    Email
                    <input type="email" name="email" required />
                </label>

                <label>
                    Password
                    <input type="password" name="password" required />
                </label>

                <button type="submit">Log in</button>
            </form>

            <p>
                Need an account? <Link to="/admin/signup">Sign up</Link>
            </p>
        </main>
    )
}