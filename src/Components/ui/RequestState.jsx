export default function RequestState({ isLoading, error, onRetry }) {
    if (isLoading) return <p className="status-message">Loading...</p>
    if (!error) return null
    return (
        <div className="status-message status-message-error" role="alert">
            <p>{error.message}</p>
            <button type="button" onClick={onRetry}>Try again</button>
        </div>
    )
}