// This file exists only for backward compatibility
// The actual implementation has been inlined in StakingPositionCard.tsx
// to avoid circular dependencies

import { ChainPosition } from "./types"

interface ChainPositionsListProps {
    chainPositions: ChainPosition[]
    onUnstake: (chainId: number) => void
}

export function ChainPositionsList({ chainPositions, onUnstake }: ChainPositionsListProps) {
    // This function is not used anymore
    return null
} 