import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import Logo from '~/../public/codexlogo.png'

export const Navbar = () => {
    return (
        <nav className="flex w-full justify-between border-b px-10 py-5">
            <Link
                className="flex flex-row items-center justify-center gap-4"
                href="/"
            >
                <Image
                    src={Logo}
                    alt="Codex"
                    width="36"
                    height="36"
                    className="cursor-pointer"
                    priority
                />
                <span className="text-2xl">Codex</span>
            </Link>
            <div className="h-full">
                <SignedOut>
                    <div className="bg-purple-500 hover:bg-purple-600">
                        <SignInButton />
                    </div>
                </SignedOut>
                <SignedIn>
                    <UserButton />
                </SignedIn>
            </div>
        </nav>
    )
}
