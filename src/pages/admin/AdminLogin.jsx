import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../../api/resources'
import { setAuthToken } from '../../api/client'
import './Admin.css'

export default function AdminLogin() {
    const navigate = useNavigate()
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    async function handleSubmit(event) {
        event.preventDefault()
        setError('')
        setIsSubmitting(true)
        const formData = new FormData(event.currentTarget)
        try {
            const result = await login({ email: formData.get('email'), password: formData.get('password') })
            setAuthToken(result.token)
            navigate('/admin/dashboard')
        } catch (requestError) {
            setError(requestError.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className="admin-login">
            <h1>Admin Access</h1>
            <p>Log in to manage PNG RFL content.</p>
            {error && <p className="form-error" role="alert">{error}</p>}

            <form onSubmit={handleSubmit}>
                <label>
                    Email
                    <input type="email" name="email" required />
                </label>

                <label>
                    Password
                    <input type="password" name="password" required />
                </label>

                <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Logging in...' : 'Log in'}</button>
            </form>

            <p>
                Need an account? <Link to="/admin/signup">Sign up</Link>
            </p>
        </main>
    )
}