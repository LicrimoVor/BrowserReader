import { ThemedView } from '@/components/view';
import { LocalFile, useLocalFiles } from '@/hooks/useLocalFiles';
import * as Sharing from 'expo-sharing';
import React, { useState } from 'react';
import { Alert, Button, FlatList, Text, View } from 'react-native';
import { LocalFileItem } from '../../components/my/localFileItem';
import { RenameModal } from '../../components/my/renameModal';

export default function LocalPage() {
    const { files, loading, error, refresh: readFiles, dir: DATA_DIR } = useLocalFiles()
    const [renameTarget, setRenameTarget] = useState < LocalFile | null>(null)
    const [isRenameModalVisible, setRenameModalVisible] = useState(false)

    const handleRename = (item: LocalFile) => {
        setRenameTarget(item)
        setRenameModalVisible(true)
    }

    const handleDelete = (item: LocalFile) => {
        item.file.delete()
    }

    const handleShare = async (item: LocalFile) => {
        try {
            console.log('item share', item)
            await Sharing.shareAsync(item.file.uri)
        } catch (e) {
            Alert.alert('Share error', e.message || String(e))
        }
    }

    const handleSaveRename = (newName: string) => {
        if (!newName || !renameTarget) return
        renameTarget.file.rename(newName)
        setRenameTarget(null)
        setRenameModalVisible(false)
        readFiles()
    }

    const addFile = () => {
        // const file = new File(DATA_DIR, 'new-file.txt')
        // file.create({ intermediates: true })
        const file = DATA_DIR.createFile('new-file2.txt', 'Hello world!')
        file.write('hello world 32132123')
        // const file = new File(DATA_DIR + '/new-file.txt')
        // file.create()
        console.log('!!!!')
        readFiles()
    }

    return (
        <View style={{ flex: 1 }}>
            <FlatList
                data={files}
                keyExtractor={(item) => item.name}
                contentContainerStyle={{ padding: 12 }}
                ListEmptyComponent={
                    <Text style={{ textAlign: 'center' }}>No local files.</Text>
                }
                renderItem={({ item }) => (
                    <LocalFileItem
                        item={item}
                        onRename={handleRename}
                        onDelete={handleDelete}
                        onShare={handleShare}
                    />
                )}
            />

            <RenameModal
                visible={isRenameModalVisible}
                item={renameTarget}
                onCancel={() => {
                    setRenameModalVisible(false)
                    setRenameTarget(null)
                }}
                onSave={handleSaveRename}
            />
            <ThemedView>
                <Button onPress={addFile} title='add'/>
            </ThemedView>
        </View>
    )
}
