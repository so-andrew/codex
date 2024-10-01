'use client'
import { Button } from '@/components/ui/button'
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi,
} from '@/components/ui/carousel'
import { cn } from '@/lib/utils'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'

export default function StatsCarousel({
    children,
    className,
}: {
    children: ReactNode[]
    className?: string
}) {
    const [api, setApi] = useState<CarouselApi>()
    const [current, setCurrent] = useState(0)

    useEffect(() => {
        if (!api) {
            return
        }
        setCurrent(api.selectedScrollSnap())

        api.on('select', () => {
            setCurrent(api.selectedScrollSnap())
        })
    }, [api])

    return (
        <div className={cn('flex flex-col gap-4 items-center', className)}>
            <Carousel setApi={setApi} className="px-6 w-full">
                <CarouselContent className="-ml-10 flex items-stretch">
                    {children.map((child, index) => (
                        <CarouselItem key={index} className="pl-10">
                            {child}
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
            <div className="flex flex-row gap-6 px-6">
                <Button
                    className="bg-purple-500 hover:bg-purple-600"
                    onClick={() => api?.scrollTo(current - 1)}
                >
                    <ArrowLeft size={14} />
                </Button>
                <Button
                    className="bg-purple-500 hover:bg-purple-600"
                    onClick={() => api?.scrollTo(current + 1)}
                >
                    <ArrowRight size={14} />
                </Button>
            </div>
        </div>
    )
}
