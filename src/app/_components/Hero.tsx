import { Button } from '@/components/ui/button'
import { SignUpButton } from '@clerk/nextjs'
import { UserRoundPlus } from 'lucide-react'

const Hero = () => {
    return (
        <section className="3xl:px-0 mx-auto flex max-w-[1440px] flex-col gap-20 bg-[radial-gradient(ellipse-at-bottom, _var(--tw-gradient-stops))] from-purple-400 to-white px-6 py-10 pb-32 text-black md:gap-28 lg:px-20 lg:py-20 xl:flex-row">
            <div className="relative z-20 flex flex-1 flex-col xl:w-1/2 py-16">
                <h1 className="text-6xl lg:text-7xl">
                    Work sm
                    <span className="text-purple-400 hover:animate-pulse">
                        art
                    </span>
                    er.
                </h1>
                <p className="text-xl mx-2 my-6 text-gray-500 xl:max-w-[520px]">
                    Codex is the home of your artist business. Track inventory,
                    record sales figures, and more.
                </p>

                <SignUpButton>
                    <Button className="items-center justify-start w-max mt-6 gap-2 rounded-full text-lg font-medium bg-purple-500 hover:bg-purple-600 px-7 py-7">
                        <UserRoundPlus size={20}></UserRoundPlus>
                        <span>Sign Up</span>
                    </Button>
                </SignUpButton>
            </div>
        </section>
    )
}

export default Hero
