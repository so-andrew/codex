import Link from 'next/link'

export const LandingFooter = () => {
    return (
        <section className="flex flex-col items-center bg-white">
            <div className="max-w-[1440px] w-full h-full flex flex-col items-center px-20 py-16">
                <p>
                    Created by{' '}
                    <Link
                        href="https://github.com/so-andrew/"
                        className="text-primary hover:text-purple-600"
                    >
                        Andrew So
                    </Link>{' '}
                    with Next.js and Tailwind CSS |{' '}
                    <Link
                        href="https://github.com/so-andrew/codex"
                        className="text-primary hover:text-purple-600"
                    >
                        Source code
                    </Link>
                </p>
            </div>
        </section>
    )
}
