import { ClerkProvider } from '@clerk/nextjs'
import '~/styles/globals.css'

import { GeistSans } from 'geist/font/sans'
import { type Metadata } from 'next'
import { Toaster } from '~/components/ui/toaster'

export const metadata: Metadata = {
    title: 'Codex',
    description: 'Codex - Artist Alley Business Tracker',
    icons: [{ rel: 'icon', url: '/favicon.ico' }],
}

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <ClerkProvider>
            <html lang="en" className={`${GeistSans.variable}`}>
                <body>
                    <main>{children}</main>
                    <Toaster />
                </body>
            </html>
        </ClerkProvider>
    )
}
