import { Colors } from '@/constants/theme'
import React from 'react'
import { StyleSheet, useColorScheme, View } from 'react-native'
import { ThemedText } from '../text'

export function Header({ isOnline }: { isOnline: boolean }) {
    const colorScheme = useColorScheme() ?? 'light'

    return (
        <View
            style={[
                styles.headerInner,
                { backgroundColor: Colors[colorScheme]['header'] },
            ]}
        >
            <View
                style={[
                    styles.statusDot,
                    {
                        backgroundColor: isOnline ? '#34D399' : '#EF4444',
                    },
                ]}
            />
            <ThemedText style={[styles.title]}>BrowserReader</ThemedText>
        </View>
    )
}

export const styles = StyleSheet.create({
    headerInner: {
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: { width: 14, height: 14, borderRadius: 6, marginRight: 8 },
    statusText: { marginRight: 12 },
    title: { fontSize: 18, fontWeight: '600' },
})
