import { SignUpButton } from '@clerk/nextjs'

const Hero = () => {
    return (
        <section className="3xl:px-0 mx-auto flex max-w-[1440px] flex-col gap-20 bg-white px-6 py-10 pb-32 text-black md:gap-28 lg:px-20 lg:py-20 xl:flex-row">
            <div className="relative z-20 flex flex-1 flex-col xl:w-1/2">
                <h1 className="text-6xl lg:text-7xl">
                    Work sm
                    <span className="text-purple-400 hover:animate-pulse">
                        art
                    </span>
                    er.
                </h1>
                <p className="regular-16 mx-2 my-6 text-gray-500 xl:max-w-[520px]">
                    Codex is the home of your artist business. Track inventory,
                    record sales figures, and more.
                </p>
                <div className="btn_purple mt-6 w-max items-center justify-center rounded-full text-xl">
                    {/* <Link href="/sign-up">
					<Button type="button" title="Get Started" variant="btn_purple"/>
					</Link> */}
                    <SignUpButton />
                </div>
            </div>
        </section>
    )
}

export default Hero
