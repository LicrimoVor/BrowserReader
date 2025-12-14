import { ThemedText } from '@/components/text'
import { Icon } from '@/components/ui/icon'
import { ThemedView } from '@/components/view'
import { Colors } from '@/constants/theme'
import { DATA_DIR } from '@/hooks/useLocalFiles'
import { File } from 'expo-file-system'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
    BackHandler,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    useColorScheme
} from 'react-native'


export default function OnlinePage() {

    return <OnlineFilePage />
}

function OnlineFilePage() {
    const [items, setItems] = useState<any[]>([])
    const [dirs, setDirs] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const path = useMemo(() => dirs.join('/'), [dirs])
    const theme = useColorScheme() || 'light'

    const loadList = useCallback(async () => {
        setLoading(true)
        const query = encodeURIComponent(path)
        const url =
            dirs.length > 0
                ? `http://192.168.1.45:8000/api/list?path=${query}`
                : 'http://192.168.1.45:8000/api/list'

        try {
            const res = await fetch(url)
            const json = await res.json()
            setItems(json)
        } catch (e) {
            console.warn('Online list error:', e)
        } finally {
            setLoading(false)
        }
    }, [path])

    useEffect(() => {
        loadList()
    }, [loadList])

    const handleDownload = async (item: any) => {
        setLoading(true)
        const filePath = dirs.length > 0 ? path + '/' + item.name : item.name
        try {
            const url = `http://192.168.1.45:8000/api/file?path=${encodeURIComponent(filePath)}`
            const output = await File.downloadFileAsync(url, DATA_DIR)
                .then(() => setLoading(false))
                .catch(() => setLoading(false))
        } catch (e) {
            console.warn('Download error:', e)
        }
    }

    const handleOpenDir = (item: any) => {
        setDirs([...dirs, item.name])
        loadList()
    }

    const handleBack = useCallback(() => {
        setDirs(dirs.slice(0, dirs.length - 1))
        loadList()
    }, [setDirs, dirs, loadList])

    useEffect(() => {
        const subscription = BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                if (dirs.length > 0) {
                    handleBack()
                    return true
                }
                return false
            },
        )

        return () => subscription.remove()
    }, [handleBack, dirs])

    return (
        <ThemedView style={{ flex: 1 }}>
            <ThemedView
                style={{
                    padding: 12,
                    borderBottomWidth: 1,
                    borderColor: '#E5E7EB',
                }}
            >
                <ThemedView
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                    }}
                >
                    <TouchableOpacity onPress={handleBack}>
                        <Icon
                            type="Ionicons"
                            size={24}
                            name={'arrow-back'}
                            color={Colors[theme]['tint']}
                        />
                    </TouchableOpacity>
                    <ThemedText style={{ fontWeight: '600' }}>
                        Online files
                    </ThemedText>
                </ThemedView>
                <ThemedText style={{ color: '#6B7280', marginTop: 4 }}>
                    Path: /{path}
                </ThemedText>
            </ThemedView>

            {loading ? (
                <ThemedView>
                    <ThemedText>Loading...</ThemedText>
                </ThemedView>
            ) : (
                <FlatList
                    data={items}
                    keyExtractor={(item, idx) => `${item.name}-${idx}`}
                    contentContainerStyle={{ padding: 12 }}
                    renderItem={({ item }) => (
                        <ThemedView style={styles.fileItem}>
                            <ThemedView>
                                {item.isDirectory ? (
                                    <Icon
                                        type="FontAwesome"
                                        size={24}
                                        name={'folder'}
                                        color={Colors[theme]['icon']}
                                    />
                                ) : (
                                    <Icon
                                        type="FontAwesome"
                                        size={24}
                                        name={'file'}
                                        color={Colors[theme]['icon']}
                                    />
                                )}
                            </ThemedView>
                            <ThemedView style={{ flex: 1 }}>
                                <ThemedText style={styles.fileName}>
                                    {item.name}
                                </ThemedText>
                                <ThemedText style={styles.fileMeta}>
                                    {item.isDirectory
                                        ? 'Directory'
                                        : `${item.size} bytes`}
                                </ThemedText>
                            </ThemedView>

                            {item.isDirectory ? (
                                <TouchableOpacity
                                    onPress={() => handleOpenDir(item)}
                                >
                                    <Icon
                                        type="FontAwesome"
                                        size={24}
                                        name={'folder-open'}
                                        color={Colors[theme]['tint']}
                                    />
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    onPress={() => handleDownload(item)}
                                >
                                    <Icon
                                        type="Feather"
                                        size={24}
                                        name={'download'}
                                        color={Colors[theme]['tint']}
                                    />
                                </TouchableOpacity>
                            )}
                        </ThemedView>
                    )}
                />
            )}
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    stepContainer: {
        gap: 8,
        marginBottom: 8,
    },
    reactLogo: {
        height: 178,
        width: 290,
        bottom: 0,
        left: 0,
        position: 'absolute',
    },
    fileItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 6,
        borderRadius: 4,
        marginBottom: 10,
    },
    fileName: { fontWeight: '600', fontSize: 16 },
    fileMeta: { color: '#6B7280', marginTop: 4 },
    fileActions: { flexDirection: 'row', marginLeft: 12 },
})
