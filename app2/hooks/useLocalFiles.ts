import { File, Directory, Paths } from 'expo-file-system';
import { useState, useEffect, useCallback } from 'react'
import { Alert } from 'react-native';

const DATA_DIR = new Directory(Paths.cache, 'asdasdwasd')
if (!DATA_DIR.exists) {
    DATA_DIR.create({intermediates: true})
}


export type LocalFile = {
    name: string
    file: File,
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
            const detailed: LocalFile[] = 
                files.map((file) => {
                    console.log("типо файл", file)
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
                }).filter((val) => val != undefined)

            console.log("всего файлов", detailed)
            setFiles(detailed)
        } catch (e) {
            console.log("ошибочкай", e)
            setError(e)
        } finally {
            setLoading(false)
        }
        console.log('files', DATA_DIR)
        console.log('files', files)
    }, [])

    useEffect(() => {
        readFiles()
    }, [readFiles])

    return { files, loading, error, refresh: readFiles, dir: DATA_DIR }
}
