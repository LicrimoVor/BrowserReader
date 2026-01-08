import { ThemedView } from '../view'

export const StatusCircle = ({
    isActive,
    size,
}: {
    isActive: boolean
    size?: number
}) => {
    return (
        <ThemedView
            style={[
                {
                    width: size || 14,
                    height: size || 14,
                    borderRadius: (size || 14) / 2,
                    marginRight: 8,
                    padding: 0,
                    margin: 0,
                    backgroundColor: isActive ? '#34D399' : '#EF4444',
                },
            ]}
        />
    )
}
