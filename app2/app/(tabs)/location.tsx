import { Status } from '@/components/status'
import { ThemedText } from '@/components/text'
import { DeleteModal } from '@/components/ui/deleteModal'
import { ThemedView } from '@/components/view'
import { LOGS_DIR } from '@/core/const'
import { LOCATION_TASK } from '@/core/tasks'
import { Colors } from '@/core/theme'
import { useInitialEffect } from '@/hooks/useInitialEffect'
import { LocalFile, useLocalFiles } from '@/hooks/useLocalFiles'
import { startLocationRecording } from '@/libs/locations'
import {
    hasStartedLocationUpdatesAsync,
    stopLocationUpdatesAsync,
} from 'expo-location'
import * as Sharing from 'expo-sharing'
import React, { useCallback, useEffect, useState } from 'react'
import { FlatList, TouchableOpacity, useColorScheme } from 'react-native'
import { LocalFileItem } from '../../components/ui/localFileItem'
import { RenameModal } from '../../components/ui/renameModal'

export default function LocalPage() {
    const {
        files,
        loading,
        error,
        refresh: readFiles,
    } = useLocalFiles(LOGS_DIR)
    const [fileTarget, setFileTarget] = useState<LocalFile | null>(null)
    const [isRenameModalVisible, setRenameModalVisible] = useState(false)
    const [isDeleteModalVisible, setDeleteModalVisible] = useState(false)
    const [isLocationStarted, setIsLocationStarted] = useState(false)
    const [writingFileName, setWritingFileName] = useState("")
    const [isError, setIsError] = useState(false)
    const [points, setPoints] = useState<any[]>([])
    const colorScheme = useColorScheme() ?? 'light'

    useInitialEffect(() => {
        (async () => {
            setIsLocationStarted(await hasStartedLocationUpdatesAsync(LOCATION_TASK))
        })()
    })

    useEffect(() => {
        const id = setInterval(async () => {
            setIsLocationStarted(await hasStartedLocationUpdatesAsync(LOCATION_TASK))
        }, 5_000)
        return () => clearInterval(id)
    }, [setIsLocationStarted])

    // const data = await getLocationFromFile()
    // const points = data.map((d) => ({
    //         latitude: d.latitude,
    //         longitude: d.longitude
    // }))
    // setPoints(points)

    const onClickHadler = useCallback(async () => {
        if (await hasStartedLocationUpdatesAsync(LOCATION_TASK)) {
            console.log("stop location")
            await stopLocationUpdatesAsync(LOCATION_TASK).then(() =>
                setIsLocationStarted(false),
            )
            setWritingFileName("")
        } else {
            const nowDate = new Date()
            const fileName = `${nowDate.getFullYear()}.${nowDate.getMonth() + 1}.${nowDate.getDate()}.json`
            setWritingFileName(fileName)
            await startLocationRecording(fileName)
        }
    }, [setWritingFileName, setIsLocationStarted])

    useEffect(() => {
        let a = setInterval(readFiles, 10_000)
        return () => clearInterval(a)
    }, [readFiles])

    const handleRename = (item: LocalFile) => {
        setFileTarget(item)
        setRenameModalVisible(true)
    }

    const handleDelete = (item: LocalFile) => {
        setFileTarget(item)
        setDeleteModalVisible(true)
    }

    const handleShare = async (item: LocalFile) => {
        try {
            await Sharing.shareAsync(item.file.uri)
        } catch (_error) {
            setIsError(true)
        }
    }

    const handleSaveRename = (newName: string) => {
        if (!newName || !fileTarget) return
        try {
            fileTarget.file.rename(newName)
        } catch (error) {
            setIsError(true)
        }
        setFileTarget(null)
        setRenameModalVisible(false)
        readFiles()
    }

    return (
        <ThemedView style={{ flex: 1, paddingTop: 14 }}>
            <FlatList
                data={files}
                keyExtractor={(item) => item.name}
                contentContainerStyle={{ padding: 12 }}
                ListEmptyComponent={
                    <ThemedText style={{ textAlign: 'center' }}>
                        На МРМ нет сохраненных файлов.
                    </ThemedText>
                }
                renderItem={({ item }) => (
                    <LocalFileItem
                        item={item}
                        onRename={handleRename}
                        onDelete={handleDelete}
                        onShare={handleShare}
                        isSelect={item.name === writingFileName}
                    />
                )}
            />
            <ThemedView style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 12
            }}>
                <ThemedView style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <ThemedText style={{ fontWeight: 'bold', fontSize: 18, paddingRight: 16 }}>
                        Статус:
                    </ThemedText>
                    <ThemedView style={{ alignItems: 'center' }}>
                        <Status isOnline={isLocationStarted} size={24} />
                        <ThemedText>
                            ({isLocationStarted ? 'вкл.' : 'выкл.'})
                        </ThemedText>

                    </ThemedView>
                </ThemedView>
                <TouchableOpacity onPress={onClickHadler} style={{ alignItems: 'center', backgroundColor: Colors[colorScheme]['sideback'], padding: 12, borderRadius: 8 }}>
                    <ThemedText style={{ fontWeight: 'bold', fontSize: 18 }}>
                        {isLocationStarted
                            ? 'Остановить трекер'
                            : 'Запустить трекер'}
                    </ThemedText>
                </TouchableOpacity>
            </ThemedView>
            <RenameModal
                visible={isRenameModalVisible}
                item={fileTarget}
                onCancel={() => {
                    setRenameModalVisible(false)
                    setFileTarget(null)
                }}
                onSave={handleSaveRename}
            />
            <DeleteModal
                visible={isDeleteModalVisible}
                onCancel={() => {
                    setDeleteModalVisible(false)
                    setFileTarget(null)
                }}
                onDelete={() => {
                    setDeleteModalVisible(false)
                    if (!fileTarget) {
                        return
                    }
                    fileTarget.file.delete()
                    readFiles()
                    setFileTarget(null)
                }}
            />
            
        </ThemedView>
    )
}
