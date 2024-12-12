import { Button } from '@/components/ui/button'
import { SignUpButton } from '@clerk/nextjs'
import { UserRoundPlus } from 'lucide-react'
import Image from 'next/image'

const Hero = () => {
    return (
        <section className=" bg-[#EDEFF1] text-black ">
            <div className="max-w-[1440px] flex flex-col 3xl:px-0 mx-auto gap-20 px-6 py-20 md:gap-28 lg:px-20 lg:flex-row">
                <div className="relative z-20 flex flex-1 flex-col items-center justify-center lg:items-start xl:w-1/2 py-16">
                    <h1 className="text-6xl lg:text-7xl">
                        Work sm
                        <span className="text-purple-400 hover:animate-pulse">
                            art
                        </span>
                        er.
                    </h1>
                    <div className="mx-2 my-6">
                        <p className="text-xl text-gray-500 xl:max-w-[520px]">
                            Codex is the home of your artist business.
                        </p>
                        <p className="text-xl text-gray-500 xl:max-w-[520px]">
                            Track inventory, record sales figures, and more.
                        </p>
                    </div>
                    <SignUpButton>
                        <Button className="items-center justify-start w-max mt-6 gap-2 rounded-full text-lg font-medium bg-purple-500 hover:bg-purple-600 px-7 py-7">
                            <UserRoundPlus size={20}></UserRoundPlus>
                            <span>Sign Up</span>
                        </Button>
                    </SignUpButton>
                </div>
                <div className="relative object-contain z-20 hidden lg:block h-full">
                    <Image
                        src="/hero2trans.png"
                        width={400}
                        height={400}
                        alt="Hero image"
                    />
                </div>
            </div>
        </section>
    )
}

export default Hero
