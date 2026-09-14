import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signup } from '../../api/resources'
import { setAuthToken } from '../../api/client'
import './Admin.css'

export default function AdminSignup() {
    const navigate = useNavigate()
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    async function handleSubmit(event) {
        event.preventDefault()
        setError('')
        setIsSubmitting(true)
        const formData = new FormData(event.currentTarget)
        try {
            const result = await signup({
                name: formData.get('name'),
                email: formData.get('email'),
                password: formData.get('password'),
            })
            setAuthToken(result.token)
            navigate('/admin/dashboard')
        } catch (requestError) {
            setError(requestError.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className="admin-signup">
            <h1>Create Admin Account</h1>
            {error && <p className="form-error" role="alert">{error}</p>}

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

                <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating account...' : 'Sign up'}</button>
            </form>

            <p>
                Already have an account? <Link to="/admin">Log in</Link>
            </p>
        </main>
    )
}