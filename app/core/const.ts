import { Directory, Paths } from 'expo-file-system'
import * as FileSystem from 'expo-file-system'

const SAF = (FileSystem as any).StorageAccessFramework

export const URL_API = __DEV__
    ? 'http://192.168.1.45:8000/api'
    : 'http://192.168.4.1:8000/api'

export const LOGS_DIR = new Directory(Paths.document, 'logs')
export const FILE_DIR = new Directory(Paths.document, 'data')

export async function initFileSystem() {
    const dirs = [LOGS_DIR, FILE_DIR]

    for (const dir of dirs) {
        const info = dir.info()
        if (!info.exists) {
            console.log(`Creating ${dir.uri}`)
            dir.create({ intermediates: true })
        }
    }
}
