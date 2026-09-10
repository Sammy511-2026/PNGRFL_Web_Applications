import { Link } from 'react-router-dom'
import './Admin.css'

export default function AdminSignup() {
    function handleSubmit(event) {
        event.preventDefault()
    }

    return (
        <main className="admin-signup">
            <h1>Create Admin Account</h1>

            <form onSubmit={handleSubmit}>
                <label>
                    Full name
                    <input type="text" name="name" required />
                </label>

                <label>
                    Email
                    <input type="email" name="email" required />
                </label>

                <label>
                    Password
                    <input type="password" name="password" required minLength={8} />
                </label>

                <button type="submit">Sign up</button>
            </form>

            <p>
                Already have an account? <Link to="/admin">Log in</Link>
            </p>
        </main>
    )
}