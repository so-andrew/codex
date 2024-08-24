import Image from "next/image"
import Link from "next/link"
import Logo from '../../../public/codex.png'
import Button from './Button'

const Navbar = () => {
    return(
        <nav className="flex justify-between items-center mx-auto max-w-[1440px] px-6 lg:px-20 3xl:px-0 relative z-30 py-5 text-black">
            <Link href='/'><Image src={Logo} alt="Codex" width="200" height="75" className="cursor-pointer" priority/></Link>
            <ul className="hidden h-full gap-12 sm:flex">
                <Link href="/about">
                    <li className="flex justify-between items-center cursor-pointer pb-1.5 transition-all ml-10 hover:border-b hover:font-bold text-xl h-full">About</li>
                </Link>
                <Link href="/privacy">
                    <li className="flex justify-between items-center cursor-pointer pb-1.5 transition-all ml-10 hover:border-b hover:font-bold text-xl h-full">Privacy</li>
                </Link>
                <div className="hidden lg:flex items-center justify-center ml-10">
                    <Link href="/sign-in">
                        <Button type="button" title="Login" variant="btn_purple"/>
                    </Link>
                </div>
            </ul>
        </nav>
    )
}

export default Navbar