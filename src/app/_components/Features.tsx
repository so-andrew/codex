import { Card, CardContent } from '@/components/ui/card'
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel'

const Features = () => {
    return (
        <section className="bg-gray-100 flex flex-col items-center">
            <div className="max-w-[1440px] w-full px-20 pb-20">
                <h1 className="text-4xl my-12">Features</h1>
                <Carousel>
                    <CarouselContent className="-ml-2">
                        <CarouselItem className="pl-2">
                            <Card>
                                <CardContent className="flex aspect-video items-center justify-center p-6">
                                    <span className="text-3xl">1</span>
                                </CardContent>
                            </Card>
                        </CarouselItem>
                        <CarouselItem className="pl-2">
                            <Card>
                                <CardContent className="flex aspect-video items-center justify-center p-6">
                                    <span className="text-3xl">2</span>
                                </CardContent>
                            </Card>
                        </CarouselItem>
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            </div>
        </section>
    )
}

export default Features
