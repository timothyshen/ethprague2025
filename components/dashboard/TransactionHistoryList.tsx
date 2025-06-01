import { ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export interface Transaction {
    id: string
    type: string
    amount: string
    sourceChain: string
    chainLogo: string
    hash: string
    timestamp: string
    status: string
}

interface TransactionHistoryListProps {
    transactions: Transaction[]
}

export function TransactionHistoryList({ transactions }: TransactionHistoryListProps) {
    return (
        <div className="space-y-4">
            {transactions.map((tx) => (
                <Card key={tx.id}>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <span className="text-lg">{tx.chainLogo}</span>
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <Badge variant="outline">{tx.type}</Badge>
                                        <span className="font-medium">{tx.amount}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Source: {tx.sourceChain} • {tx.timestamp}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Badge variant="secondary">{tx.status}</Badge>
                                <Button size="sm" variant="ghost">
                                    <ExternalLink className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
} 