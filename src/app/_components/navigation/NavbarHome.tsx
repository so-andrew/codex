import Logo from '@/../public/codexlogo.png'
import { Button } from '@/components/ui/button'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import { UserRound } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

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
            <ul className="h-full gap-12 sm:flex">
                <div className="ml-10 items-center justify-center text-xl lg:flex">
                    <SignedOut>
                        <SignInButton>
                            <Button className="items-center justify-start w-max gap-2 rounded-full text-lg font-medium bg-purple-500 hover:bg-purple-600 px-7 py-7">
                                <UserRound size={20}></UserRound>
                                <span>Sign In</span>
                            </Button>
                        </SignInButton>
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
