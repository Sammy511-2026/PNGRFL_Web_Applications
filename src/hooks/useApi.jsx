import { useCallback, useEffect, useState } from 'react'

export function useApi(loader, initialValue) {
    const [data, setData] = useState(initialValue)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    const reload = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            setData(await loader())
        } catch (requestError) {
            setError(requestError)
        } finally {
            setIsLoading(false)
        }
    }, [loader])

    useEffect(() => {
        reload()
    }, [reload])

    return { data, setData, isLoading, error, reload }
}

