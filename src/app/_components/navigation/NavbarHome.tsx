import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import Logo from '~/../public/codexlogo.png'

const NavbarHome = () => {
    return (
        <nav className="3xl:px-0 relative z-30 mx-auto flex max-w-[1440px] items-center justify-between px-6 py-5 text-black lg:px-20">
            <Link
                className="flex flex-row items-center justify-center gap-4"
                href="/"
            >
                <Image
                    src={Logo}
                    alt="Codex"
                    width="48"
                    height="48"
                    className="cursor-pointer"
                    priority
                />
                <span className="text-3xl">Codex</span>
            </Link>
            <ul className="hidden h-full gap-12 sm:flex">
                <div className="ml-10 items-center justify-center text-xl lg:flex">
                    <SignedOut>
                        {/* <Link href="/sign-in">
                            <Button type="button" title="Login" variant="btn_purple"/>
                        </Link> */}
                        <div className="btn_purple rounded-full">
                            <SignInButton />
                        </div>
                    </SignedOut>
                    <SignedIn>
                        <UserButton />
                    </SignedIn>
                </div>
            </ul>
        </nav>
    )
}

export default NavbarHome
