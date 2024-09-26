'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Info } from 'lucide-react'

export default function CollapsibleStats() {
    return (
        <Collapsible className="w-fit">
            <CollapsibleTrigger asChild>
                <Button
                    variant="ghost"
                    className="flex flex-row gap-4 justify-center items-center py-4"
                >
                    <Info></Info>
                    <span>More Stats</span>
                </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <div className="flex mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Title</CardTitle>
                        </CardHeader>
                        <CardContent>test</CardContent>
                    </Card>
                </div>
            </CollapsibleContent>
        </Collapsible>
    )
}
