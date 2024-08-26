import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import Navbar from "./_components/Navbar";

export const metadata: Metadata = {
	title: "Codex",
  	description: "Codex - Artist Alley Business Tracker",
  	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  	children,
}: Readonly<{ children: React.ReactNode }>) {
  	return (
		<ClerkProvider>
			<html lang="en" className={`${GeistSans.variable}`}>
				<body>
					<main>
						<Navbar/>
						{children}
					</main>
				</body>
			</html>
		</ClerkProvider>
  	);
}
