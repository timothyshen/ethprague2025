"use client"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { StakingPosition } from "./types"

interface UnstakeDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    selectedPosition: { position: StakingPosition, chainId: number } | null
    destinationChain: string
    setDestinationChain: (chain: string) => void
    totalBalance: string | undefined
    onUnstake: () => void
    isLoading: boolean
}

export function UnstakeDialog({
    open,
    onOpenChange,
    selectedPosition,
    destinationChain,
    setDestinationChain,
    totalBalance,
    onUnstake,
}: UnstakeDialogProps) {
    if (!selectedPosition) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Unstake ETH</DialogTitle>
                    <DialogDescription>Select which chain you want to receive your unstaked ETH on.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="flex items-center space-x-2 p-2 border rounded-md">
                        <span className="text-lg">{selectedPosition.position.chainLogo}</span>
                        <div>
                            <p className="font-medium">
                                {totalBalance} {selectedPosition.position.token}
                            </p>
                            <p className="text-sm text-muted-foreground">Source: {selectedPosition.position.sourceChain}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Confirm Unstake</Label>
                        <RadioGroup value={destinationChain} onValueChange={setDestinationChain} className="space-y-3">
                            {selectedPosition.chainId === 11_155_111 && (
                                <div className="flex items-center space-x-2 rounded-md border p-3">
                                    <RadioGroupItem value="ethereum" id="ethereum" />
                                    <Label htmlFor="ethereum" className="flex flex-1 items-center justify-between cursor-pointer">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xl">🔷</span>
                                            <span>Ethereum</span>
                                        </div>
                                    </Label>
                                </div>
                            )}
                            {selectedPosition.chainId === 545 && (
                                <div className="flex items-center space-x-2 rounded-md border p-3">
                                    <RadioGroupItem value="flow" id="flow" />
                                    <Label htmlFor="flow" className="flex flex-1 items-center justify-between cursor-pointer">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xl">🌊</span>
                                            <span>Flow</span>
                                        </div>
                                    </Label>
                                </div>
                            )}
                            {selectedPosition.chainId === 296 && (
                                <div className="flex items-center space-x-2 rounded-md border p-3">
                                    <RadioGroupItem value="hedera" id="hedera" />
                                    <Label htmlFor="hedera" className="flex flex-1 items-center justify-between cursor-pointer">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xl">♦️</span>
                                            <span>Hedera</span>
                                        </div>
                                    </Label>
                                </div>
                            )}
                        </RadioGroup>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={onUnstake}>Confirm Unstake</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
} 