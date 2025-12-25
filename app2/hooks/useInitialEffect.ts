import { useEffect } from 'react'

export const useInitialEffect = (fn: () => void) => {
    useEffect(() => {
        fn()
    }, [])
}
