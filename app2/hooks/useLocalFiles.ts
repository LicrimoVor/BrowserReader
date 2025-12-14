import { File, Directory, Paths } from 'expo-file-system'
import { useState, useEffect, useCallback } from 'react'
import { Alert } from 'react-native'

export const DATA_DIR = new Directory(Paths.document, 'asdasdwasd')
if (!DATA_DIR.exists) {
    DATA_DIR.create({ intermediates: true })
}

export type LocalFile = {
    name: string
    file: File
    size?: number
    modified?: number
}

export function useLocalFiles() {
    const [files, setFiles] = useState<LocalFile[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<any>(null)

    const readFiles = useCallback(() => {
        try {
            setLoading(true)
            setError(null)

            const files = DATA_DIR.list()
            const detailed: LocalFile[] = files
                .map((file) => {
                    if (Paths.info(file.uri).isDirectory) {
                        return
                    }
                    const info = file.info()

                    return {
                        name: file.name,
                        file: file as File,
                        size: info.size,
                        modified: info.modificationTime,
                    }
                })
                .filter((val) => val != undefined)
                .sort(
                    (a, b) =>
                        -(
                            (a.file.creationTime || 0) -
                            (b.file.creationTime || 0)
                        ),
                )

            setFiles(detailed)
            // const test_file = detailed[0]
            // setFiles(Array(1000).fill(0).map((_, i) => ({...test_file, name: `${i}.jpg`})))
        } catch (e) {
            setError(e)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        readFiles()
    }, [readFiles])

    return { files, loading, error, refresh: readFiles, dir: DATA_DIR }
}
