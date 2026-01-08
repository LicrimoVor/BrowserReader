import { Icon } from '@/components/icon'
import { ThemedText } from '@/components/text'
import { DeleteModal } from '@/components/ui/deleteModal'
import { LocationFileItem } from '@/components/ui/locationFileItem'
import { StatusCircle } from '@/components/ui/status'
import { ThemedView } from '@/components/view'
import { LOGS_DIR } from '@/core/const'
import { LOCATION_TASK, LOCATION_TASK_FILENAME } from '@/core/tasks'
import { Colors } from '@/core/theme'
import { useInitialEffect } from '@/hooks/useInitialEffect'
import { LocalFile, useLocalFiles } from '@/hooks/useLocalFiles'
import { startLocationRecording } from '@/libs/locations'
import AsyncStorage from '@react-native-async-storage/async-storage'
import {
    hasStartedLocationUpdatesAsync,
    stopLocationUpdatesAsync,
} from 'expo-location'
import * as Sharing from 'expo-sharing'
import React, { useCallback, useEffect, useState } from 'react'
import {
    ActivityIndicator,
    FlatList,
    TouchableOpacity,
    useColorScheme,
} from 'react-native'

export default function LocalPage() {
    const { files, refresh: readFiles } = useLocalFiles(LOGS_DIR)
    const [fileTarget, setFileTarget] = useState<LocalFile | null>(null)
    // const [isRenameModalVisible, setRenameModalVisible] = useState(false)
    const [isDeleteModalVisible, setDeleteModalVisible] = useState(false)
    const [isLocationStarted, setIsLocationStarted] = useState(false)
    const [writingFileName, setWritingFileName] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isError, setIsError] = useState(false)
    const theme = useColorScheme() ?? 'light'

    useInitialEffect(() => {
        setIsLoading(true)
        ;(async () => {
            setIsLocationStarted(
                await hasStartedLocationUpdatesAsync(LOCATION_TASK),
            )
            const fileName = await AsyncStorage.getItem(LOCATION_TASK_FILENAME)
            if (fileName) setWritingFileName(fileName)
            setIsLoading(false)
        })()
    })

    useEffect(() => {
        const id = setInterval(async () => {
            setIsLocationStarted(
                await hasStartedLocationUpdatesAsync(LOCATION_TASK),
            )
        }, 5_000)
        return () => clearInterval(id)
    }, [setIsLocationStarted])

    const onClickHadler = useCallback(async () => {
        if (isLoading) return
        setIsLoading(true)
        if (await hasStartedLocationUpdatesAsync(LOCATION_TASK)) {
            console.log('stop location')
            await stopLocationUpdatesAsync(LOCATION_TASK).then(() =>
                setIsLocationStarted(false),
            )
            setWritingFileName('')
        } else {
            const nowDate = new Date()
            const fileName = `${nowDate.getFullYear()}.${nowDate.getMonth() + 1}.${nowDate.getDate()}.json`
            setWritingFileName(fileName)
            await startLocationRecording(fileName)
        }
        setIsLocationStarted(
            await hasStartedLocationUpdatesAsync(LOCATION_TASK),
        )
        setIsLoading(false)
    }, [setWritingFileName, setIsLocationStarted, isLoading, setIsLoading])

    useEffect(() => {
        let a = setInterval(readFiles, 10_000)
        return () => clearInterval(a)
    }, [readFiles])

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

    const onSetDirectory = async () => {
        // try {
        //     await startLocationRecording(writingFileName)
        // } catch (error) {
        //     setIsError(true)
        // }
    }

    // const handleRename = (item: LocalFile) => {
    //     setFileTarget(item)
    //     setRenameModalVisible(true)
    // }

    // const handleSaveRename = (newName: string) => {
    //     if (!newName || !fileTarget) return
    //     try {
    //         fileTarget.file.rename(newName)
    //     } catch (error) {
    //         setIsError(true)
    //     }
    //     setFileTarget(null)
    //     setRenameModalVisible(false)
    //     readFiles()
    // }

    return (
        <ThemedView style={{ flex: 1, paddingTop: 14 }}>
            <ThemedView style={{ alignItems: 'center' }}>
                <ThemedText>
                    {isLocationStarted ? 'Мониторинг включен' : 'Мониторинг выключен'}
                </ThemedText>
                <TouchableOpacity
                    onPress={onSetDirectory}
                    style={{ flex: 1, alignItems: 'flex-end' }}
                >
                    <Icon
                        type="Octicons"
                        size={32}
                        name={'file-directory-symlink'}
                        color={Colors[theme]['tint']}
                    />
                </TouchableOpacity>
            </ThemedView>

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
                    <LocationFileItem
                        item={item}
                        onDelete={handleDelete}
                        onShare={handleShare}
                        isSelect={item.name === writingFileName}
                    />
                )}
            />
            <ThemedView
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 14,
                    borderTopWidth: 1,
                    borderColor: '#E5E7EB',
                }}
            >
                <ThemedView
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <ThemedText
                        style={{
                            fontWeight: 'bold',
                            fontSize: 18,
                            paddingRight: 16,
                        }}
                    >
                        Статус:
                    </ThemedText>
                    <ThemedView style={{ alignItems: 'center' }}>
                        {isLoading ? (
                            <>
                                <ActivityIndicator size={24} />
                                <ThemedText>Загрузка</ThemedText>
                            </>
                        ) : (
                            <>
                                <StatusCircle
                                    isActive={isLocationStarted}
                                    size={24}
                                />
                                <ThemedText>
                                    ({isLocationStarted ? 'вкл.' : 'выкл.'})
                                </ThemedText>
                            </>
                        )}
                    </ThemedView>
                </ThemedView>
                <TouchableOpacity
                    onPress={onClickHadler}
                    style={{
                        alignItems: 'center',
                        backgroundColor: Colors[theme]['sideback'],
                        padding: 14,
                        borderRadius: 8,
                    }}
                >
                    <ThemedText style={{ fontWeight: 'bold', fontSize: 32 }}>
                        {isLocationStarted ? 'Закончить' : '   Начать   '}
                    </ThemedText>
                </TouchableOpacity>
            </ThemedView>
            {/* <RenameModal
                visible={isRenameModalVisible}
                item={fileTarget}
                onCancel={() => {
                    setRenameModalVisible(false)
                    setFileTarget(null)
                }}
                onSave={handleSaveRename}
            /> */}
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
