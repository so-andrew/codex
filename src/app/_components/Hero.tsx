import Link from "next/link"
import Button from "./Button"

const Hero = () => {
  return (
    <section className="mx-auto max-w-[1440px] px-6 lg:px-20 3xl:px-0 flex flex-col gap-20 py-10 pb-32 md:gap-28 lg:py-20 xl:flex-row bg-white text-black">
        <div className="relative z-20 flex flex-1 flex-col xl:w-1/2">
            <h1 className="text-6xl lg:text-7xl">Work sm<span className="text-purple-400 hover:animate-pulse">art</span>er.</h1>
            <p className="regular-16 my-6 mx-2 text-gray-500 xl:max-w-[520px]">Codex is the home of your artist business. Track inventory, record sales figures, and more.</p>
            <div className="items-center justify-center mt-6">
                <Link href="/sign-up">
                  <Button type="button" title="Get Started" variant="btn_purple"/>
                </Link>
            </div>
        </div>
    </section>
  )
}

export default Hero