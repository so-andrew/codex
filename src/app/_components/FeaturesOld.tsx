import { Card, CardContent } from '@/components/ui/card'
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel'
import Image from 'next/image'

const FeaturesOld = () => {
    return (
        <section className="bg-gray-100 flex flex-col items-center">
            <div className="max-w-[1440px] w-full px-20 pb-20">
                <h1 className="text-4xl my-12">Features</h1>
                <Carousel>
                    <CarouselContent className="-ml-2">
                        <CarouselItem className="pl-2">
                            <Card>
                                <CardContent className="flex aspect-video items-center justify-center p-6">
                                    <Image
                                        src="/features1.png"
                                        height={1920}
                                        width={1200}
                                        alt="Manage product library"
                                    />
                                </CardContent>
                            </Card>
                        </CarouselItem>
                        <CarouselItem className="pl-2">
                            <Card>
                                <CardContent className="flex aspect-video items-center justify-center p-6">
                                    <Image
                                        src="/features2.png"
                                        height={1920}
                                        width={1200}
                                        alt="Track convention sales"
                                    />
                                </CardContent>
                            </Card>
                        </CarouselItem>
                        <CarouselItem className="pl-2">
                            <Card>
                                <CardContent className="flex aspect-video items-center justify-center p-6">
                                    <Image
                                        src="/features3.png"
                                        height={1400}
                                        width={1050}
                                        alt="Track convention sales"
                                    />
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

export default FeaturesOld
