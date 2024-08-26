import Image from "next/image"
import Link from "next/link"
import Logo from '../../../public/codex.png'
import Button from './Button'
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"

const Navbar = () => {
    return(
        <nav className="flex justify-between items-center mx-auto max-w-[1440px] px-6 lg:px-20 3xl:px-0 relative z-30 py-5 text-black ">
            <Link href='/'><Image src={Logo} alt="Codex" width="200" height="75" className="cursor-pointer" priority/></Link>
            <ul className="hidden h-full gap-12 sm:flex">
                <div className="lg:flex items-center justify-center ml-10 text-xl">
                    <SignedOut>
                        {/* <Link href="/sign-in">
                            <Button type="button" title="Login" variant="btn_purple"/>
                        </Link> */}
                        <div className="btn_purple rounded-full"><SignInButton/></div>
                    </SignedOut>
                    <SignedIn>
                        <UserButton/>
                    </SignedIn>
                </div>
            </ul>
        </nav>
    )
}

export default Navbar