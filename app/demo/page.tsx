import { Navbar } from "@/components/layout/navbar"
import { EnhancedStakingDemo } from "@/components/enhanced-staking-demo"

export default function DemoPage() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-4">Enhanced Staking Demo</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl">
                        This demo showcases the new global state management system for balance tracking
                        and transaction management with the 2min 25s compose delay feature.
                    </p>
                </div>

                <EnhancedStakingDemo />
            </main>
        </div>
    )
} 